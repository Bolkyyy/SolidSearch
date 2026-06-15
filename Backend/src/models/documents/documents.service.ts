import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Documents } from './documents.entity';
import { DocumentFiles } from './document_files.entity';
import { IndexJobs } from '../index_jobs/index_jobs.entity';
import { UploadDocumentDto } from './dto/upload-document.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import WordExtractor from 'word-extractor';
import OpenAI from 'openai';
import { AiSettings } from '../../modules/ai/entity/ai-settings.entity';
import { decrypt } from '../../modules/ai/Encryption/crypto';
import { NotificationsService } from '../../modules/notifications/notifications.service';
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');
const officeparser = require('officeparser');
const CFB = require('cfb');

const CHUNK_SIZE = 6000;
const CHUNK_MAX_TOKENS = 1500;
const MAX_STORED_CHARS = 300_000;
const MAX_AI_CHARS = 60_000;

interface ExtractionResult {
  text: string;
  pageCount: number | null;
}

@Injectable()
export class DocumentService {
  private chunkSize = CHUNK_SIZE;
  private chunkMaxTokens = CHUNK_MAX_TOKENS;
  private maxStoredChars = MAX_STORED_CHARS;
  private maxAiChars = MAX_AI_CHARS;

  constructor(
    @InjectRepository(Documents)
    private readonly documentsRepository: Repository<Documents>,

    @InjectRepository(DocumentFiles)
    private readonly documentFilesRepository: Repository<DocumentFiles>,

    @InjectRepository(AiSettings)
    private readonly aiSettingsRepository: Repository<AiSettings>,

    @InjectRepository(IndexJobs)
    private readonly indexJobsRepository: Repository<IndexJobs>,

    private readonly notificationsService: NotificationsService,
  ) {}

  getIndexingConfig() {
    return {
      chunkSize: this.chunkSize,
      chunkMaxTokens: this.chunkMaxTokens,
      maxStoredChars: this.maxStoredChars,
      maxAiChars: this.maxAiChars,
    };
  }

  updateIndexingConfig(dto: { chunkSize?: number; chunkMaxTokens?: number; maxStoredChars?: number; maxAiChars?: number }) {
    if (dto.chunkSize != null) this.chunkSize = dto.chunkSize;
    if (dto.chunkMaxTokens != null) this.chunkMaxTokens = dto.chunkMaxTokens;
    if (dto.maxStoredChars != null) this.maxStoredChars = dto.maxStoredChars;
    if (dto.maxAiChars != null) this.maxAiChars = dto.maxAiChars;
    return this.getIndexingConfig();
  }

  private async getAiClient(): Promise<{ client: OpenAI; model: string }> {
    const settings = await this.aiSettingsRepository.findOne({
      where: { id: 1 },
    });

    const rawKey = settings?.api_key || process.env.AI_API_KEY || '';
    let apiKey = rawKey;

    const parts = rawKey.split(':');
    const isEncrypted = parts.length === 2 && /^[0-9a-f]{32}$/i.test(parts[0]);
    if (isEncrypted) {
      try {
        apiKey = decrypt(rawKey);
      } catch {}
    }

    const model = settings?.model_name || 'deepseek-chat';
    const baseURL = settings?.base_url || 'https://api.deepseek.com/v1';

    return { client: new OpenAI({ apiKey, baseURL }), model };
  }

  private async buildAiSummary(rawText: string): Promise<string> {
    if (rawText.trim().length < 100) return rawText.trim();

    const { client, model } = await this.getAiClient();
    const truncated = rawText.slice(0, 8000);

    const response = await client.chat.completions.create({
      model,
      max_tokens: 400,
      messages: [
        {
          role: 'system',
          content: `Ты — аналитик архивных документов.
                    Напиши краткое содержание документа (3-5 предложений).
                    - Передай СУТЬ: о чём документ, ключевые факты/решения/данные
                    - Не пересказывай структуру — передавай смысл
                    - Не используй фразы "документ содержит", "в документе говорится"
                    - Отвечай на том же языке что и документ`,
        },
        {
          role: 'user',
          content: `Напиши краткое содержание:\n\n${truncated}`,
        },
      ],
    });

    return (
      response.choices[0].message.content?.trim() || rawText.slice(0, 500)
    );
  }

  private splitIntoChunks(text: string, size: number): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      let end = Math.min(i + size, text.length);
      if (end < text.length) {
        const lastNewline = text.lastIndexOf('\n', end);
        if (lastNewline > i + size * 0.7) end = lastNewline + 1;
      }
      chunks.push(text.slice(i, end));
      i = end;
    }
    return chunks;
  }

  private async formatChunk(
    client: OpenAI,
    model: string,
    chunk: string,
    chunkIndex: number,
    totalChunks: number,
  ): Promise<string> {
    const isFirst = chunkIndex === 0;
    const isLast = chunkIndex === totalChunks - 1;

    const contextHint =
      totalChunks > 1
        ? `Это часть ${chunkIndex + 1} из ${totalChunks}. ${isFirst ? 'Начало документа.' : ''} ${isLast ? 'Конец документа.' : 'Продолжение следует.'}`
        : '';

    const response = await client.chat.completions.create({
      model,
      max_tokens: this.chunkMaxTokens,
      messages: [
        {
          role: 'system',
          content: `Ты — редактор документов. ${contextHint}
                    Приведи извлечённый текст к читаемому виду:
                    - Восстанови логическую структуру: заголовки, разделы, абзацы
                    - Убери технический мусор (артефакты PDF, лишние пробелы, дубли строк)
                    - Сохрани ВСЕ данные и факты — ничего не удаляй и не придумывай
                    - Используй Markdown: ## для заголовков, **жирный** для ключевых терминов, - для списков
                    - НЕ добавляй вводных фраз типа "Вот отформатированный текст:"
                    - Просто выдай готовый текст
                    - Отвечай на том же языке что и документ`,
        },
        {
          role: 'user',
          content: chunk,
        },
      ],
    });

    return response.choices[0].message.content?.trim() || chunk;
  }

  private async buildAiFormattedText(rawText: string): Promise<string> {
    if (rawText.trim().length < 50) return rawText.trim();

    const { client, model } = await this.getAiClient();
    const chunks = this.splitIntoChunks(rawText, this.chunkSize);

    console.log(`[FORMAT] Разбито на ${chunks.length} чанков`);

    const formattedChunks: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const formatted = await this.formatChunk(
        client,
        model,
        chunks[i],
        i,
        chunks.length,
      );
      formattedChunks.push(formatted);
      console.log(`[FORMAT] Чанк ${i + 1}/${chunks.length} готов`);
    }

    return formattedChunks.join('\n\n---\n\n');
  }

  private async withRetry<T>(
    label: string,
    fn: () => Promise<T>,
    attempts = 4,
  ): Promise<T> {
    for (let i = 1; i <= attempts; i++) {
      try {
        return await fn();
      } catch (err: any) {
        const isConn =
          err?.message?.includes('Connection terminated') ||
          err?.message?.includes('connection') ||
          err?.code === 'ECONNRESET' ||
          err?.code === 'ECONNREFUSED';
        if (!isConn || i === attempts) throw err;
        const delay = 600 * i;
        console.warn(
          `[RETRY] ${label}: попытка ${i}/${attempts}, повтор через ${delay}мс`,
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw new Error(`[RETRY] ${label}: все попытки исчерпаны`);
  }

  private extractTextFromRtf(buffer: Buffer): string {
    let rtf = buffer.toString('latin1');

    rtf = rtf.replace(/\{\\pict[^}]*\}/gs, '');
    rtf = rtf.replace(/\{\\object[^}]*\}/gs, '');

    rtf = rtf.replace(/\\par[d]?\s?/g, '\n');
    rtf = rtf.replace(/\\line\s?/g, '\n');
    rtf = rtf.replace(/\\page\s?/g, '\n');

    rtf = rtf.replace(/\\u(-?\d+)\??/g, (_, n) => {
      const code = parseInt(n);
      return String.fromCharCode(code < 0 ? code + 65536 : code);
    });

    rtf = rtf.replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );

    rtf = rtf.replace(/\\[a-z*]+[-\d]*\s?/gi, '');
    rtf = rtf.replace(/[{}\\]/g, '');

    rtf = rtf.replace(/[ \t]+/g, ' ');
    rtf = rtf.replace(/\n{3,}/g, '\n\n');

    return rtf.trim();
  }

  private async extractFromFile(
    filePath: string,
    mimeType: string,
  ): Promise<ExtractionResult> {
    const buffer = fs.readFileSync(filePath);
    const effectiveMime = this.normalizeMimeType(filePath, mimeType);

    switch (effectiveMime) {
      case 'application/pdf': {
        const uint8Array = new Uint8Array(buffer);
        const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
        const pdf = await loadingTask.promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        return { text, pageCount: pdf.numPages };
      }

      case 'application/msword': {
        const extractor = new WordExtractor();
        const extracted = await extractor.extract(filePath);
        return { text: extracted.getBody(), pageCount: null };
      }

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        const result = await mammoth.extractRawText({ buffer });
        return { text: result.value, pageCount: null };
      }
      
      case 'text/plain':
        return { text: buffer.toString('utf-8'), pageCount: null };

      case 'text/markdown':
      case 'text/x-markdown':
        return { text: buffer.toString('utf-8'), pageCount: null };

      case 'image/png':
      case 'image/jpeg':
      case 'image/tiff':
      case 'image/webp': {
        const { data } = await Tesseract.recognize(filePath, 'rus+eng');
        return { text: data.text, pageCount: 1 };
      }

      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const text = workbook.SheetNames.map((name) => {
          const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[name]);
          const content = this.csvToPlainText(csv);
          return `### ${name}\n\n${content}`;
        }).join('\n\n');
        return { text, pageCount: workbook.SheetNames.length };
      }

      case 'application/vnd.oasis.opendocument.spreadsheet': {
        const ast = await officeparser.parseOffice(filePath);
        return { text: ast.toText(), pageCount: null };
      }

      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
        const ast = await officeparser.parseOffice(filePath);
        return { text: ast.toText(), pageCount: null };
      }

      case 'application/vnd.ms-powerpoint': {
        const text = this.extractTextFromPptBinary(buffer);
        return { text, pageCount: null };
      }

      case 'application/rtf':
      case 'text/rtf': {
        const ast = await officeparser.parseOffice(filePath);
        return { text: ast.toText(), pageCount: null };
      }

      case 'text/csv':
      case 'application/csv':
        return { text: this.csvToPlainText(buffer.toString('utf-8')), pageCount: null };

      default:
        return { text: '', pageCount: null };
    }
  }

  private async processAndSave(
    fileId: number,
    documentId: number,
    filePath: string,
    mimeType: string,
    docTitle: string,
    userId: number | null = null,
    isReindex: boolean = false,
  ): Promise<void> {
    let jobId: number | undefined;
    try {
      const job = await this.withRetry('create index job', () =>
        this.indexJobsRepository.save({
          document_id: documentId,
          status: 'processing',
          parser_type: mimeType,
          started_at: new Date(),
        }),
      );
      jobId = job.id;
    } catch (e) {
      console.error('[INDEX_JOB] create failed:', e);
    }

    try {
      const fullPath = path.resolve(filePath);
      console.log(`[EXTRACT] fileId=${fileId} mime=${mimeType}`);

      const { text: fullText, pageCount } = await this.extractFromFile(
        fullPath,
        mimeType,
      );

      const wasTruncated = fullText.length > this.maxStoredChars;
      const rawText = wasTruncated ? fullText.slice(0, this.maxStoredChars) : fullText;

      if (!rawText.trim()) {
        console.log(`[EXTRACT] fileId=${fileId} — пустой текст`);
        await this.withRetry('set empty', () =>
          this.documentFilesRepository.update(fileId, {
            extraction_status: 'empty',
            ...(pageCount != null ? { page_count: pageCount } : {}),
          }),
        );
        await this.withRetry('set processed', () =>
          this.documentsRepository.update(documentId, { status: 'processed' }),
        );
        this.notificationsService.create({
          userId,
          title: 'Документ пустой',
          message: `"${docTitle}" — текст не извлечён, документ пуст или не читаем.`,
          category: 'warning',
          link: '/indexing',
        }).catch(() => {});
        return;
      }

      console.log(
        `[EXTRACT] fileId=${fileId} — ${rawText.length} символов` +
          (wasTruncated ? ` (обрезано с ${fullText.length})` : '') +
          ', сохраняем',
      );
      await this.withRetry('save raw text', () =>
        this.documentFilesRepository.update(fileId, {
          extracted_text: rawText,
          normalized_text: rawText.slice(0, 1500),
          extraction_status: 'text_extracted',
          ...(pageCount != null ? { page_count: pageCount } : {}),
        }),
      );

      const aiText = rawText.slice(0, this.maxAiChars);
      try {
        const detectedLanguage = this.detectLanguage(rawText);
        const [summary, formattedText] = await Promise.all([
          this.buildAiSummary(aiText),
          this.buildAiFormattedText(aiText),
        ]);

        await this.withRetry('save ai result', () =>
          this.documentFilesRepository.update(fileId, {
            extracted_text: formattedText,
            normalized_text: summary,
            extraction_status: 'processed',
          }),
        );
        await this.withRetry('set doc processed', () =>
          this.documentsRepository.update(documentId, {
            status: 'processed',
            language: detectedLanguage,
          }),
        );
        console.log(`[AI] fileId=${fileId} — AI-обработка завершена`);
        this.notificationsService.create({
          userId,
          title: 'Индексация завершена',
          message: `"${docTitle}" успешно проиндексирован и доступен для поиска.`,
          category: 'success',
          link: '/indexing',
        }).catch(() => {});
      } catch (aiErr: any) {
        console.error(`[AI] fileId=${fileId} — ошибка AI:`, aiErr.message);
        await this.withRetry('mark processed after ai fail', () =>
          this.documentFilesRepository.update(fileId, {
            extraction_status: 'processed',
          }),
        );
        await this.withRetry('set doc processed (no ai)', () =>
          this.documentsRepository.update(documentId, {
            status: 'processed',
            language: this.detectLanguage(rawText),
          }),
        );
        this.notificationsService.create({
          userId,
          title: 'Индексация без AI',
          message: `"${docTitle}" проиндексирован, но AI-обработка завершилась с ошибкой.`,
          category: 'warning',
          link: '/indexing',
        }).catch(() => {});
      }
      if (jobId) {
        await this.withRetry('complete index job', () =>
          this.indexJobsRepository.update(jobId!, {
            status: 'completed',
            finished_at: new Date(),
          }),
        ).catch((e) => console.error('[INDEX_JOB] complete failed:', e));
      }
    } catch (e: any) {
      console.error(`[PROCESS ERROR] fileId=${fileId}:`, e.message);
      try {
        await this.documentFilesRepository.update(fileId, { extraction_status: 'extraction_failed' });
        await this.documentsRepository.update(documentId, { status: 'extraction_failed' });
      } catch {}
      if (jobId) {
        this.indexJobsRepository.update(jobId, {
          status: 'failed',
          finished_at: new Date(),
          error_message: String(e.message).slice(0, 500),
        }).catch(() => {});
      }
      this.notificationsService.create({
        userId,
        title: 'Ошибка индексации',
        message: `"${docTitle}" не удалось проиндексировать. Попробуйте загрузить повторно.`,
        category: 'warning',
      }).catch(() => {});
    }
  }

  async uploadDocument(
    file: Express.Multer.File,
    dto: UploadDocumentDto,
  ): Promise<{ document: Documents; file: DocumentFiles }> {
    const originalName = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );
    const mimeType = this.normalizeMimeType(file.path, file.mimetype);

    const document = await this.withRetry('save document', () =>
      this.documentsRepository.save({
        user_id: dto.user_id ? Number(dto.user_id) : null,
        collection_id: dto.collection_id ?? null,
        title: dto.title ?? originalName,
        document_type: this.getDocumentType(mimeType),
        archive_number: dto.archive_number ?? '',
        document_date: new Date(),
        author_name: dto.author_name ?? '',
        status: 'processing',
        language: 'Определяется...',
      }),
    );

    const documentFile = await this.withRetry('save document_file', () =>
      this.documentFilesRepository.save({
        document_id: document.id,
        file_name: originalName,
        file_type: mimeType,
        file_path: file.path,
        file_size: file.size,
        extraction_status: 'pending',
      }),
    );

    const docUserId = dto.user_id ? Number(dto.user_id) : null;

    this.processAndSave(
      documentFile.id,
      document.id,
      file.path,
      mimeType,
      document.title ?? originalName,
      docUserId,
    ).catch((e) => console.error('[UPLOAD PROCESS ERROR]', e));

    this.notificationsService.create({
      userId: docUserId,
      title: 'Документ загружен',
      message: `"${document.title ?? originalName}" загружен и поставлен в очередь на индексацию.`,
      category: 'info',
      link: '/indexing',
    }).catch(() => {});

    return { document, file: documentFile };
  }

  async extractAllText(): Promise<{ message: string; total: number }> {
    const allFiles = await this.documentFilesRepository.find();
    for (const file of allFiles) {
      await this.documentFilesRepository.update(file.id, { extraction_status: 'pending' });
      const doc = await this.documentsRepository.findOne({ where: { id: file.document_id } });
      this.processAndSave(file.id, file.document_id, file.file_path, file.file_type, doc?.title ?? file.file_name, doc?.user_id ?? null, true)
        .catch((e) => console.error('[RE-EXTRACT-ALL ERROR]', e));
    }
    return { message: `Переизвлечение запущено для ${allFiles.length} файлов`, total: allFiles.length };
  }

  private reindexCancelFlags = new Map<number, boolean>();
  private reindexActiveSet = new Set<number>();

  cancelCollectionReindex(collectionId: number): void {
    this.reindexCancelFlags.set(collectionId, true);
  }

  isReindexActive(collectionId: number): boolean {
    return this.reindexActiveSet.has(collectionId);
  }

  async extractCollectionText(collectionId: number): Promise<{ message: string; total: number }> {
    const docs = await this.documentsRepository.find({ where: { collection_id: collectionId } });

    const colRows = await this.documentsRepository.manager.query(
      `SELECT name FROM solidsearchdb.document_collections WHERE id = $1`,
      [collectionId],
    );
    const collectionName: string = colRows[0]?.name ?? `#${collectionId}`;
    const userId: number | null = docs.find(d => d.user_id)?.user_id ?? null;

    const tasks: Array<{ fileId: number; docId: number; filePath: string; fileType: string; title: string; userIdDoc: number | null }> = [];

    for (const doc of docs) {
      const files = await this.documentFilesRepository.find({ where: { document_id: doc.id } });
      for (const file of files) {
        await this.documentFilesRepository.update(file.id, { extraction_status: 'pending' });
        await this.documentsRepository.update(doc.id, { status: 'processing' });
        tasks.push({ fileId: file.id, docId: doc.id, filePath: file.file_path, fileType: file.file_type, title: doc.title ?? file.file_name, userIdDoc: doc.user_id ?? null });
      }
    }

    const total = tasks.length;
    this.reindexCancelFlags.set(collectionId, false);

    this.notificationsService.create({
      userId,
      title: 'Переиндексация запущена',
      message: `Коллекция «${collectionName}»: ${total} ${this.pluralFiles(total)} поставлено в очередь.`,
      category: 'info',
      link: '/indexing',
    }).catch(() => {});

    this.reindexActiveSet.add(collectionId);

    (async () => {
      let done = 0, failed = 0;
      try {
        for (const t of tasks) {
          if (this.reindexCancelFlags.get(collectionId)) {
            this.reindexCancelFlags.delete(collectionId);
            this.notificationsService.create({
              userId,
              title: 'Переиндексация отменена',
              message: `Коллекция «${collectionName}»: обработано ${done} из ${total} ${this.pluralFiles(total)}.`,
              category: 'warning',
              link: '/indexing',
            }).catch(() => {});
            return;
          }
          const result = await this.processAndSave(t.fileId, t.docId, t.filePath, t.fileType, t.title, t.userIdDoc, true)
            .then(() => 'ok' as const)
            .catch((e) => { console.error('[RE-EXTRACT-COLLECTION ERROR]', e); return 'fail' as const; });
          if (result === 'ok') done++; else failed++;
        }
        this.reindexCancelFlags.delete(collectionId);
        const msg = failed === 0
          ? `Коллекция «${collectionName}»: успешно переиндексировано ${done} ${this.pluralFiles(done)}.`
          : `Коллекция «${collectionName}»: ${done} из ${total} ${this.pluralFiles(total)} переиндексировано, ${failed} с ошибкой.`;
        this.notificationsService.create({
          userId,
          title: failed === 0 ? 'Переиндексация завершена' : 'Переиндексация завершена с ошибками',
          message: msg,
          category: failed === 0 ? 'success' : 'warning',
          link: '/indexing',
        }).catch(() => {});
      } finally {
        this.reindexActiveSet.delete(collectionId);
      }
    })().catch(e => console.error('[REINDEX LOOP ERROR]', e));

    return { message: `Переиндексация запущена для ${total} файлов`, total };
  }

  private pluralFiles(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'файл';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'файла';
    return 'файлов';
  }

  async extractText(documentId: number): Promise<{ message: string }> {
    const files = await this.documentFilesRepository.find({ where: { document_id: documentId } });
    if (!files.length) throw new NotFoundException('Файлы не найдены');
    const doc = await this.documentsRepository.findOne({ where: { id: documentId } });
    for (const file of files) {
      await this.documentFilesRepository.update(file.id, { extraction_status: 'pending' });
      this.processAndSave(file.id, documentId, file.file_path, file.file_type, doc?.title ?? file.file_name, doc?.user_id ?? null, true)
        .catch((e) => console.error('[RE-EXTRACT ERROR]', e));
    }
    return { message: `Извлечение запущено для ${files.length} файлов` };
  }

  async deleteDocument(id: number): Promise<{ message: string }> {
    const doc = await this.documentsRepository.findOne({ where: { id }, relations: ['files'] });
    if (!doc) throw new NotFoundException(`Document ${id} not found`);

    for (const file of doc.files ?? []) {
      if (file.file_path) {
        try {
          const fullPath = path.resolve(file.file_path);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        } catch {}
      }
    }

    await this.documentFilesRepository.delete({ document_id: id });
    await this.documentsRepository.delete(id);

    return { message: `Document ${id} deleted` };
  }

  async findall(userId?: number, limit?: number): Promise<Documents[]> {
    const qb = this.documentsRepository
      .createQueryBuilder('doc')
      .leftJoin('doc.files', 'f')
      .select([
        'doc.id', 'doc.user_id', 'doc.collection_id', 'doc.title', 'doc.document_type',
        'doc.archive_number', 'doc.document_date', 'doc.author_name',
        'doc.status', 'doc.language', 'doc.created_at',
        'f.id', 'f.document_id', 'f.file_name', 'f.file_type',
        'f.file_size', 'f.page_count', 'f.normalized_text',
        'f.extraction_status', 'f.uploaded_at',
      ])
      .orderBy('doc.created_at', 'DESC');

    if (userId) {
      qb.where('(doc.user_id = :userId OR doc.user_id IS NULL)', { userId });
    }

    if (limit) {
      qb.limit(limit);
    }

    return await qb.getMany();
  }

  async getCollectionSizes(): Promise<{ collection_id: number; total_size: number }[]> {
    return await this.documentsRepository
      .createQueryBuilder('doc')
      .innerJoin('doc.files', 'f')
      .select('doc.collection_id', 'collection_id')
      .addSelect('COALESCE(SUM(f.file_size), 0)', 'total_size')
      .where('doc.collection_id IS NOT NULL')
      .groupBy('doc.collection_id')
      .getRawMany();
  }

  async getDocumentJobs(documentId: number) {
    return await this.indexJobsRepository.find({
      where: { document_id: documentId },
      order: { started_at: 'ASC' },
    });
  }

  async findbyid(id: number): Promise<Documents> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['files'],
    });
    if (!document) throw new NotFoundException(`Document ${id} not found`);
    return document;
  }

  async findByCollectionId(
    collectionId: number,
    page = 1,
    limit = 20,
    search?: string,
    docType?: string,
  ): Promise<{ data: Documents[]; total: number }> {
    const countQb = this.documentsRepository
      .createQueryBuilder('doc')
      .where('doc.collection_id = :collectionId', { collectionId });

    if (search?.trim()) {
      countQb.andWhere('LOWER(doc.title) LIKE :search', {
        search: `%${search.toLowerCase().trim()}%`,
      });
    }
    if (docType && docType !== 'all') {
      countQb.andWhere("UPPER(COALESCE(doc.document_type, '')) = :docType", {
        docType: docType.toUpperCase(),
      });
    }
    const total = await countQb.getCount();

    const dataQb = this.documentsRepository
      .createQueryBuilder('doc')
      .leftJoin('doc.files', 'f')
      .select([
        'doc.id', 'doc.collection_id', 'doc.title', 'doc.document_type',
        'doc.archive_number', 'doc.document_date', 'doc.author_name',
        'doc.status', 'doc.language', 'doc.created_at',
        'f.id', 'f.document_id', 'f.file_name', 'f.file_type',
        'f.file_size', 'f.page_count', 'f.extraction_status', 'f.uploaded_at',
      ])
      .where('doc.collection_id = :collectionId', { collectionId });

    if (search?.trim()) {
      dataQb.andWhere('LOWER(doc.title) LIKE :search', {
        search: `%${search.toLowerCase().trim()}%`,
      });
    }
    if (docType && docType !== 'all') {
      dataQb.andWhere("UPPER(COALESCE(doc.document_type, '')) = :docType", {
        docType: docType.toUpperCase(),
      });
    }

    const data = await dataQb
      .orderBy('doc.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async getCollectionStats(collectionId: number): Promise<{
    total: number;
    processed: number;
    processing: number;
    failed: number;
    types: string[];
  }> {
    const rawStats = await this.documentsRepository
      .createQueryBuilder('doc')
      .select('doc.status', 'status')
      .addSelect('COUNT(doc.id)', 'count')
      .where('doc.collection_id = :collectionId', { collectionId })
      .groupBy('doc.status')
      .getRawMany();

    let total = 0, processed = 0, processing = 0, failed = 0;
    for (const row of rawStats) {
      const n = Number(row.count);
      total += n;
      if (row.status === 'processed') processed += n;
      else if (row.status === 'processing' || row.status === 'pending') processing += n;
      else if (row.status === 'extraction_failed') failed += n;
    }

    const rawTypes = await this.documentsRepository
      .createQueryBuilder('doc')
      .select('UPPER(doc.document_type)', 'type')
      .where(
        "doc.collection_id = :collectionId AND doc.document_type IS NOT NULL AND doc.document_type <> ''",
        { collectionId },
      )
      .distinct(true)
      .getRawMany();

    const types = rawTypes.map((r: any) => r.type as string).filter(Boolean);

    return { total, processed, processing, failed, types };
  }

  async getCollectionFiles(collectionId: number): Promise<{ filePath: string; fileName: string; missing?: boolean; docTitle?: string; rawPath?: string }[]> {
    const docs = await this.documentsRepository.find({
      where: { collection_id: collectionId },
      relations: ['files'],
    });
    const result: { filePath: string; fileName: string; missing?: boolean; docTitle?: string; rawPath?: string }[] = [];
    const usedNames = new Set<string>();
    const backendRoot = path.resolve(process.cwd());
    const uploadsDir = path.join(backendRoot, 'uploads', 'documents');

    const resolveFilePath = (rawPath: string): string | null => {
      const normalized = rawPath.replace(/\\/g, '/');
      const basename = path.basename(rawPath);
      const candidates = [
        path.resolve(rawPath),
        path.join(backendRoot, normalized),
        path.join(backendRoot, rawPath),
        path.resolve(__dirname, '../../..', normalized),
        path.join(uploadsDir, basename),
      ];
      return candidates.find(p => fs.existsSync(p)) ?? null;
    };

    for (const doc of docs) {
      if (!doc.files?.length) {
        result.push({ filePath: '', fileName: doc.title || `document_${doc.id}`, missing: true, docTitle: doc.title, rawPath: '' });
        continue;
      }
      for (const file of doc.files) {
        if (!file.file_path?.trim()) {
          result.push({ filePath: '', fileName: file.file_name || `doc_${doc.id}`, missing: true, docTitle: doc.title, rawPath: '' });
          continue;
        }
        const resolved = resolveFilePath(file.file_path);
        const ext = path.extname(file.file_name || file.file_path);
        const base = path.basename(file.file_name || file.file_path, ext);
        let name = `${base}${ext}`;
        if (usedNames.has(name)) name = `${base}_${doc.id}${ext}`;
        usedNames.add(name);
        if (resolved) {
          result.push({ filePath: resolved, fileName: name, rawPath: file.file_path });
        } else {
          console.warn('[DOWNLOAD] Not found:', file.file_path);
          result.push({ filePath: '', fileName: name, missing: true, docTitle: doc.title, rawPath: file.file_path });
        }
      }
    }
    return result;
  }

  async findByIds(ids: number[]): Promise<Documents[]> {
    if (ids.length === 0) return [];
    return await this.documentsRepository.find({
      where: { id: In(ids) },
      relations: ['files'],
    });
  }

  async setCollectionId(
    documentId: number,
    collectionId: number | null,
  ): Promise<Documents> {
    await this.withRetry('set collection_id', () =>
      this.documentsRepository.update(documentId, {
        collection_id: collectionId,
      }),
    );
    return await this.findbyid(documentId);
  }

  private transliterate(word: string): string | null {
    const map: Record<string, string> = {
      а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y',
      к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',  с: 's',  т: 't', у: 'u', ф: 'f',
      х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    };
    const hasRussian = /[а-яё]/i.test(word);
    if (!hasRussian) return null;
    return word
      .toLowerCase()
      .split('')
      .map((c) => map[c] ?? c)
      .join('');
  }

  private getSynonyms(word: string): string[] {
    const groups = [
      ['квиз', 'викторина', 'тест', 'опрос', 'quiz'],
      ['договор', 'контракт', 'соглашение'],
      ['задача', 'задачи', 'задание', 'план', 'todo'],
      ['архив', 'хранилище', 'repository'],
      ['поиск', 'search', 'найти', 'искать'],
      ['лазер', 'лазеры', 'laser'],
      ['криминалистика', 'экспертиза', 'forensic'],
      ['казак', 'казаки', 'казачий', 'казачьи', 'казачье'],
      ['формула', 'формулы', 'уравнение'],
      ['физика', 'physics'],
      ['распределение', 'distribution'],
      ['интеграция', 'integration', 'внедрение'],
    ];
    const result: string[] = [];
    for (const group of groups) {
      if (
        group.some(
          (w) =>
            word.startsWith(w.slice(0, Math.min(w.length, 4))) ||
            w.startsWith(word.slice(0, 4)),
        )
      ) {
        result.push(...group.filter((w) => w !== word));
      }
    }
    return result;
  }

  async searchDocuments(
    query: string,
    filters?: { period?: string; source?: string; format?: string; formats?: string; collection?: string },
  ): Promise<Documents[]> {
    const stopWords = new Set([
      'найди', 'найти', 'покажи', 'документ', 'документы', 'файл', 'файлы',
      'про', 'для', 'все', 'мне', 'нужно', 'хочу', 'где', 'как', 'что', 'это',
      'такое', 'какие', 'который', 'которые', 'нужен', 'можно', 'есть',
    ]);
    const baseWords = query
      .toLowerCase()
      .replace(/[^\wа-яё\s]/gi, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    if (baseWords.length === 0) return [];

    const searchWords: string[] = [];

    for (const w of baseWords) {
      searchWords.push(w);
      const synonyms = this.getSynonyms(w);
      for (const s of synonyms) searchWords.push(s);
      const stem = w.replace(
        /(ую|ой|ый|ий|ая|яя|ое|ее|ом|ем|ых|их|ам|ям|ов|ев|ах|ях|ей|ью|ю|у|а|я|о|е|и|ы)$/i,
        '',
      );
      if (stem.length > 3 && stem !== w) searchWords.push(stem);
      const translit = this.transliterate(w);
      if (translit) searchWords.push(translit);
      if (stem.length > 3) {
        const transStem = this.transliterate(stem);
        if (transStem) searchWords.push(transStem);
      }
    }

    const words = [...new Set(searchWords)];
    if (words.length === 0) return [];

    const params: Record<string, string | number> = {};
    words.forEach((w, i) => {
      params[`w${i}`] = `%${w}%`;
    });

    const titleConds = words
      .map((_, i) => `LOWER(doc.title) LIKE :w${i}`)
      .join(' OR ');
    const fileNameConds = words
      .map((_, i) => `LOWER(f.file_name) LIKE :w${i}`)
      .join(' OR ');
    const summConds = words
      .map((_, i) => `LOWER(f.normalized_text) LIKE :w${i}`)
      .join(' OR ');

    const textWhere = `(${titleConds}) OR (${fileNameConds}) OR (${summConds})`;

    const qb = this.documentsRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.files', 'f')
      .where(textWhere)
      .setParameters(params);

    if (filters?.period && filters.period !== 'all') {
      const year = parseInt(filters.period, 10);
      if (!isNaN(year)) {
        qb.andWhere(
          'EXTRACT(YEAR FROM COALESCE(doc.document_date, doc.created_at)) = :year',
          { year },
        );
      }
    }

    const activeFormats = this.resolveFormats(filters);
    if (activeFormats.length > 0) {
      const fmtConditions = activeFormats
        .map((_, i) => `LOWER(f.file_name) LIKE :fmt${i}`)
        .join(' OR ');
      const fmtParams: Record<string, string> = {};
      activeFormats.forEach((fmt, i) => { fmtParams[`fmt${i}`] = `%.${fmt}`; });
      qb.andWhere(`(${fmtConditions})`, fmtParams);
    }

    if (filters?.collection && filters.collection !== 'all') {
      const colId = parseInt(filters.collection, 10);
      if (!isNaN(colId)) {
        qb.andWhere('doc.collection_id = :colId', { colId });
      }
    }

    return await qb
      .orderBy('doc.created_at', 'DESC')
      .limit(20)
      .getMany();
  }

  private resolveFormats(filters?: { format?: string; formats?: string }): string[] {
    if (filters?.formats) {
      return filters.formats.split(',').map((f) => f.trim().toLowerCase()).filter(Boolean);
    }
    if (filters?.format && filters.format !== 'all') {
      return [filters.format.toLowerCase()];
    }
    return [];
  }

  applyFiltersToList(
    docs: Documents[],
    filters?: { period?: string; source?: string; format?: string; formats?: string; collection?: string },
  ): Documents[] {
    if (!filters) return docs;
    let result = docs;

    if (filters.period && filters.period !== 'all') {
      const year = parseInt(filters.period, 10);
      if (!isNaN(year)) {
        result = result.filter((doc) => {
          const date = doc.document_date ?? doc.created_at;
          return date && new Date(date).getFullYear() === year;
        });
      }
    }

    const activeFormats = this.resolveFormats(filters);
    if (activeFormats.length > 0) {
      result = result.filter((doc) =>
        doc.files?.some((f) =>
          activeFormats.some((fmt) => f.file_name?.toLowerCase().endsWith(`.${fmt}`))
        ),
      );
    }

    if (filters.collection && filters.collection !== 'all') {
      const colId = parseInt(filters.collection, 10);
      if (!isNaN(colId)) {
        result = result.filter((doc) => doc.collection_id === colId);
      }
    }

    return result;
  }

  private detectLanguage(text: string): string {
    const cyrillic = (text.match(/[Ѐ-ӿ]/g) ?? []).length;
    const latin = (text.match(/[a-zA-Z]/g) ?? []).length;
    const total = cyrillic + latin;
    if (total < 20) return 'Неизвестен';
    const ratio = cyrillic / total;
    if (ratio > 0.6) return 'Русский';
    if (ratio < 0.4) return 'Английский';
    return 'Смешанный';
  }

  private normalizeMimeType(filePath: string, mimeType: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const extMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
      '.txt': 'text/plain',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.tiff': 'image/tiff',
      '.tif': 'image/tiff',
      '.webp': 'image/webp',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.rtf': 'application/rtf',
      '.md': 'text/markdown',
      '.markdown': 'text/markdown',
      '.csv': 'text/csv',
      '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
    };
    return extMap[ext] ?? mimeType;
  }

  private async extractTextFromFile(
    filePath: string,
    mimeType: string,
  ): Promise<string> {
    const { text } = await this.extractFromFile(filePath, mimeType);
    return text;
  }

  private csvToPlainText(csv: string): string {
    return csv
      .split('\n')
      .map((line) => {
        const cells = line
          .split(',')
          .map((c) => c.trim().replace(/^"|"$/g, '').trim())
          .filter((c) => c.length > 0);
        return cells.join('  ');
      })
      .filter((line) => line.trim().length > 0)
      .join('\n');
  }

  private extractTextFromPptBinary(buffer: Buffer): string {
    try {
      const cfb = CFB.read(buffer, { type: 'buffer' });
      const entry = CFB.find(cfb, 'PowerPoint Document');
      if (!entry?.content) return '';

      const stream = Buffer.from(entry.content as Uint8Array);
      const texts: string[] = [];

      for (let i = 0; i < stream.length - 8; ) {
        const recType = stream.readUInt16LE(i + 2);
        const recLen = stream.readUInt32LE(i + 4);

        if (recLen > 0 && recLen < 0x100000 && i + 8 + recLen <= stream.length) {
          if (recType === 0x0fa0) {
            const text = stream
              .subarray(i + 8, i + 8 + recLen)
              .toString('utf16le')
              .trim();
            if (text) texts.push(text);
          } else if (recType === 0x0fa8) {
            const text = stream
              .subarray(i + 8, i + 8 + recLen)
              .toString('latin1')
              .trim();
            if (text) texts.push(text);
          }
        }

        i += 8 + (recLen > 0 ? recLen : 1);
      }

      return texts.join('\n');
    } catch {
      return '';
    }
  }

  private getDocumentType(mimeType: string): string {
    const types: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'application/msword': 'DOC',
      'text/plain': 'TXT',
      'image/png': 'PNG',
      'image/jpeg': 'JPG',
      'image/tiff': 'TIFF',
      'image/webp': 'WEBP',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
      'application/vnd.ms-powerpoint': 'PPT',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
      'application/rtf': 'RTF',
      'text/rtf': 'RTF',
      'text/markdown': 'MD',
      'text/x-markdown': 'MD',
      'text/csv': 'CSV',
      'application/csv': 'CSV',
      'application/vnd.oasis.opendocument.spreadsheet': 'ODS',
    };
    return types[mimeType] ?? 'UNKNOWN';
  }
}
