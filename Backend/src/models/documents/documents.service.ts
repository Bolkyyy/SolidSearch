import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Documents } from './documents.entity';
import { DocumentFiles } from '../document_files/document_files.entity';
import { UploadDocumentDto } from './dto/upload-document.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import WordExtractor from 'word-extractor';
import OpenAI from 'openai';
import { AiSettings } from '../../modules/ai/entity/ai-settings.entity';
import { decrypt } from '../../modules/ai/Encryption/crypto';
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');

const CHUNK_SIZE = 6000;
const CHUNK_MAX_TOKENS = 1500;

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Documents)
    private readonly documentsRepository: Repository<Documents>,

    @InjectRepository(DocumentFiles)
    private readonly documentFilesRepository: Repository<DocumentFiles>,

    @InjectRepository(AiSettings)
    private readonly aiSettingsRepository: Repository<AiSettings>,
  ) {}

  private async getAiClient(): Promise<{ client: OpenAI; model: string }> {
    const settings = await this.aiSettingsRepository.findOne({ where: { id: 1 } });

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

  // Краткое содержание

  private async buildAiSummary(rawText: string): Promise<string> {
    if (rawText.trim().length < 100) return rawText.trim();

    try {
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

      return response.choices[0].message.content?.trim() || rawText.slice(0, 500);
    } catch (e: any) {
      console.error('[SUMMARY ERROR]', e.message);
      return rawText.slice(0, 500).trim() + '…';
    }
  }

  // Форматирование полного текста чанками 
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

    const contextHint = totalChunks > 1
      ? `Это часть ${chunkIndex + 1} из ${totalChunks}. ${isFirst ? 'Начало документа.' : ''} ${isLast ? 'Конец документа.' : 'Продолжение следует.'}`
      : '';

    const response = await client.chat.completions.create({
      model,
      max_tokens: CHUNK_MAX_TOKENS,
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

    try {
      const { client, model } = await this.getAiClient();
      const chunks = this.splitIntoChunks(rawText, CHUNK_SIZE);

      console.log(`[FORMAT] Разбито на ${chunks.length} чанков`);

      const formattedChunks: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const formatted = await this.formatChunk(client, model, chunks[i], i, chunks.length);
        formattedChunks.push(formatted);
        console.log(`[FORMAT] Чанк ${i + 1}/${chunks.length} готов`);
      }

      return formattedChunks.join('\n\n---\n\n');
    } catch (e: any) {
      console.error('[FORMAT ERROR]', e.message);
      return rawText;
    }
  }

  // Retry-обёртка для DB-операций (защита от обрывов PgBouncer)
  private async withRetry<T>(label: string, fn: () => Promise<T>, attempts = 4): Promise<T> {
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
        console.warn(`[RETRY] ${label}: попытка ${i}/${attempts}, повтор через ${delay}мс`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    throw new Error(`[RETRY] ${label}: все попытки исчерпаны`);
  }

  // Обработка файла

  private async processAndSave(
    fileId: number,
    documentId: number,
    filePath: string,
    mimeType: string,
  ): Promise<void> {
    try {
      const fullPath = path.resolve(filePath);
      const rawText = await this.extractTextFromFile(fullPath, mimeType);

      if (!rawText.trim()) {
        await this.withRetry('set empty', () => this.documentFilesRepository.update(fileId, { extraction_status: 'empty' }));
        await this.withRetry('set processed', () => this.documentsRepository.update(documentId, { status: 'processed' }));
        return;
      }

      const [summary, formattedText] = await Promise.all([
        this.buildAiSummary(rawText),
        this.buildAiFormattedText(rawText),
      ]);

      await this.withRetry('save extracted text', () =>
        this.documentFilesRepository.update(fileId, {
          extracted_text: formattedText,
          normalized_text: summary,
          extraction_status: 'processed',
        }),
      );
      await this.withRetry('set doc processed', () =>
        this.documentsRepository.update(documentId, { status: 'processed' }),
      );
      console.log(`[PROCESS] document_id: ${documentId} — готово`);
    } catch (e) {
      console.error(`[PROCESS ERROR] document_id: ${documentId}`, e);
      try {
        await this.withRetry('set failed', () => this.documentFilesRepository.update(fileId, { extraction_status: 'failed' }));
        await this.withRetry('set extraction_failed', () => this.documentsRepository.update(documentId, { status: 'extraction_failed' }));
      } catch (e2) {
        console.error(`[PROCESS ERROR] не удалось обновить статус`, e2);
      }
    }
  }

  // Загрузка документа

  async uploadDocument(
    file: Express.Multer.File,
    dto: UploadDocumentDto,
  ): Promise<{ document: Documents; file: DocumentFiles }> {
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const document = await this.withRetry('save document', () =>
      this.documentsRepository.save({
        collection_id: dto.collection_id ?? 1,
        title: dto.title ?? originalName,
        document_type: this.getDocumentType(file.mimetype),
        archive_number: dto.archive_number ?? '',
        document_date: new Date(),
        author_name: dto.author_name ?? '',
        status: 'processing',
        language: dto.language ?? 'ru',
      }),
    );

    const documentFile = await this.withRetry('save document_file', () =>
      this.documentFilesRepository.save({
        document_id: document.id,
        file_name: originalName,
        file_type: file.mimetype,
        file_path: file.path,
        file_size: file.size,
        extraction_status: 'pending',
      }),
    );

    this.processAndSave(documentFile.id, document.id, file.path, file.mimetype).catch((e) =>
      console.error('[UPLOAD PROCESS ERROR]', e),
    );

    return { document, file: documentFile };
  }

  async extractAllText(): Promise<{ message: string; total: number }> {
    const allFiles = await this.documentFilesRepository.find();
    for (const file of allFiles) {
      await this.documentFilesRepository.update(file.id, { extraction_status: 'pending' });
      this.processAndSave(file.id, file.document_id, file.file_path, file.file_type).catch((e) =>
        console.error('[RE-EXTRACT-ALL ERROR]', e),
      );
    }
    return { message: `Переизвлечение запущено для ${allFiles.length} файлов`, total: allFiles.length };
  }

  async extractText(documentId: number): Promise<{ message: string }> {
    const files = await this.documentFilesRepository.find({
      where: { document_id: documentId },
    });

    if (!files.length) throw new NotFoundException('Файлы не найдены');

    for (const file of files) {
      await this.documentFilesRepository.update(file.id, { extraction_status: 'pending' });
      this.processAndSave(file.id, documentId, file.file_path, file.file_type).catch((e) =>
        console.error('[RE-EXTRACT ERROR]', e),
      );
    }

    return { message: `Извлечение запущено для ${files.length} файлов` };
  }

  private transliterate(word: string): string | null {
    const map: Record<string, string> = {
      'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh',
      'з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o',
      'п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts',
      'ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
    };
    const hasRussian = /[а-яё]/i.test(word);
    if (!hasRussian) return null;
    return word.toLowerCase().split('').map((c) => map[c] ?? c).join('');
  }

  private getSynonyms(word: string): string[] {
    const groups = [
      ['квиз','викторина','тест','опрос','quiz'],
      ['договор','контракт','соглашение'],
      ['задача','задачи','задание','план','todo'],
      ['архив','хранилище','repository'],
      ['поиск','search','найти','искать'],
      ['лазер','лазеры','laser'],
      ['криминалистика','экспертиза','forensic'],
      ['казак','казаки','казачий','казачьи','казачье'],
      ['формула','формулы','уравнение'],
      ['физика','physics'],
      ['распределение','distribution'],
      ['интеграция','integration','внедрение'],
    ];
    const result: string[] = [];
    for (const group of groups) {
      if (group.some((w) => word.startsWith(w.slice(0, Math.min(w.length, 4))) || w.startsWith(word.slice(0, 4)))) {
        result.push(...group.filter((w) => w !== word));
      }
    }
    return result;
  }

  async searchDocuments(query: string): Promise<Documents[]> {
    const stopWords = new Set([
      'найди','найти','покажи','документ','документы','файл','файлы',
      'про','для','все','мне','нужно','хочу','где','как','что','это',
      'такое','какие','который','которые','нужен','можно','есть',
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
      const stem = w.replace(/(ую|ой|ый|ий|ая|яя|ое|ее|ом|ем|ых|их|ам|ям|ов|ев|ах|ях|ей|ью|ю|у|а|я|о|е|и|ы)$/i, '');
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

    const params: Record<string, string> = {};
    words.forEach((w, i) => { params[`w${i}`] = `%${w}%`; });

    const titleConds = words.map((_, i) => `LOWER(doc.title) LIKE :w${i}`).join(' OR ');
    const fileNameConds = words.map((_, i) => `LOWER(f.file_name) LIKE :w${i}`).join(' OR ');
    const summConds = words.map((_, i) => `LOWER(f.normalized_text) LIKE :w${i}`).join(' OR ');

    const where = `(${titleConds}) OR (${fileNameConds}) OR (${summConds})`;

    return await this.documentsRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.files', 'f')
      .where(where)
      .setParameters(params)
      .orderBy('doc.created_at', 'DESC')
      .limit(20)
      .getMany();
  }

  async findall(): Promise<Documents[]> {
    return await this.documentsRepository.find({ relations: ['files'] });
  }

  async findByIds(ids: number[]): Promise<Documents[]> {
    if (ids.length === 0) return [];
    return await this.documentsRepository.find({
      where: { id: In(ids) },
      relations: ['files'],
    });
  }

  async findbyid(id: number): Promise<Documents> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['files', 'metadata'],
    });
    if (!document) throw new NotFoundException(`Document ${id} not found`);
    return document;
  }

  private async extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);

    switch (mimeType) {
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
        return text;
      }
      case 'application/msword': {
        const extractor = new WordExtractor();
        const extracted = await extractor.extract(filePath);
        return extracted.getBody();
      }
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      }
      case 'text/plain':
        return buffer.toString('utf-8');
      case 'image/png':
      case 'image/jpeg':
      case 'image/tiff': {
        const { data } = await Tesseract.recognize(filePath, 'rus+eng');
        return data.text;
      }
      default:
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
    };
    return types[mimeType] ?? 'UNKNOWN';
  }
}