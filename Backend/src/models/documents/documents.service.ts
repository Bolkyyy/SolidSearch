// documents.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
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

    // AI-клиент из настроек БД
    private async getAiClient(): Promise<{ client: OpenAI; model: string }> {
        const settings = await this.aiSettingsRepository.findOne({ where: { id: 1 } });

        const rawKey = settings?.api_key || process.env.AI_API_KEY || '';
        let apiKey = rawKey;

        const parts = rawKey.split(':');
        const isEncrypted = parts.length === 2 && /^[0-9a-f]{32}$/i.test(parts[0]);
        if (isEncrypted) {
            try { apiKey = decrypt(rawKey); } catch {}
        }

        const model = settings?.model_name || 'deepseek-v4-flash';
        const baseURL = settings?.base_url || 'https://api.deepseek.com/v1';

        return { client: new OpenAI({ apiKey, baseURL }), model };
    }

    // AI: краткое содержание (суть документа) 
    private async buildAiSummary(rawText: string): Promise<string> {
        if (rawText.trim().length < 100) return rawText.trim();

        try {
            const { client, model } = await this.getAiClient();
            const truncated = rawText.slice(0, 8000);

            const response = await client.chat.completions.create({
                model,
                max_tokens: 300,
                messages: [
                    {
                        role: 'system',
                        content: `Ты — аналитик архивных документов.
                                    Твоя задача — написать краткое содержание документа (3-5 предложений).
                                    Требования:
                                    - Передай СУТЬ документа: о чём он, какие ключевые факты/решения/данные содержит
                                    - Не пересказывай структуру, а передавай смысл
                                    - Не используй фразы "документ содержит", "в документе говорится" — пиши по существу
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

    // AI: форматированный полный текст 
    private async buildAiFormattedText(rawText: string): Promise<string> {
        if (rawText.trim().length < 50) return rawText.trim();

        try {
            const { client, model } = await this.getAiClient();
            const truncated = rawText.slice(0, 12000);

            const response = await client.chat.completions.create({
                model,
                max_tokens: 2000,
                messages: [
                    {
                        role: 'system',
                        content: `Ты — редактор документов.
                                    Твоя задача — привести извлечённый текст документа к читаемому виду.
                                    Требования:
                                    - Восстанови логическую структуру: заголовки, разделы, абзацы
                                    - Убери технический мусор (артефакты PDF-извлечения, лишние пробелы, дубли строк)
                                    - Сохрани ВСЕ данные и факты из оригинала — ничего не удаляй и не придумывай
                                    - Используй Markdown: ## для заголовков, **жирный** для ключевых терминов, - для списков
                                    - Если текст уже чистый — просто аккуратно структурируй его
                                    - Отвечай на том же языке что и документ`,
                    },
                    {
                        role: 'user',
                        content: `Отформатируй текст документа:\n\n${truncated}`,
                    },
                ],
            });

            return response.choices[0].message.content?.trim() || rawText;
        } catch (e: any) {
            console.error('[FORMAT ERROR]', e.message);
            return rawText;
        }
    }

    // Фоновая обработка файла
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
                await this.documentFilesRepository.update(fileId, { extraction_status: 'empty' });
                await this.documentsRepository.update(documentId, { status: 'processed' });
                return;
            }

            // Суть и форматирование — параллельно
            const [summary, formattedText] = await Promise.all([
                this.buildAiSummary(rawText),
                this.buildAiFormattedText(rawText),
            ]);

            await this.documentFilesRepository.update(fileId, {
                extracted_text: formattedText,
                normalized_text: summary,
                extraction_status: 'processed',
            });

            await this.documentsRepository.update(documentId, { status: 'processed' });
            console.log(`[PROCESS] document_id: ${documentId} — готово`);
        } catch (e) {
            console.error(`[PROCESS ERROR] document_id: ${documentId}`, e);
            await this.documentFilesRepository.update(fileId, { extraction_status: 'failed' });
            await this.documentsRepository.update(documentId, { status: 'extraction_failed' });
        }
    }

    // Загрузка документ
    async uploadDocument(
        file: Express.Multer.File,
        dto: UploadDocumentDto,
    ): Promise<{ document: Documents; file: DocumentFiles }> {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

        const document = await this.documentsRepository.save({
            collection_id: dto.collection_id ?? 1,
            title: dto.title ?? originalName,
            document_type: this.getDocumentType(file.mimetype),
            archive_number: dto.archive_number ?? '',
            document_date: new Date(),
            author_name: dto.author_name ?? '',
            status: 'processing',
            language: dto.language ?? 'ru',
        });

        const documentFile = await this.documentFilesRepository.save({
            document_id: document.id,
            file_name: originalName,
            file_type: file.mimetype,
            file_path: file.path,
            file_size: file.size,
            extraction_status: 'pending',
        });

        // Не блокируем ответ — обрабатываем в фоне
        this.processAndSave(documentFile.id, document.id, file.path, file.mimetype)
            .catch(e => console.error('[UPLOAD PROCESS ERROR]', e));

        return { document, file: documentFile };
    }

    // Ручной перезапуск извлечения
    async extractText(documentId: number): Promise<{ message: string }> {
        const files = await this.documentFilesRepository.find({
            where: { document_id: documentId },
        });

        if (!files.length) throw new NotFoundException('Файлы не найдены');

        for (const file of files) {
            await this.documentFilesRepository.update(file.id, { extraction_status: 'pending' });
            this.processAndSave(file.id, documentId, file.file_path, file.file_type)
                .catch(e => console.error('[RE-EXTRACT ERROR]', e));
        }

        return { message: `Извлечение запущено для ${files.length} файлов` };
    }

    // Поиск документов
    async searchDocuments(query: string): Promise<Documents[]> {
        const words = query
            .toLowerCase()
            .replace(/[^\wа-яё\s]/gi, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3);

        const seen = new Set<number>();
        const results: Documents[] = [];

        for (const word of words) {
            const pattern = `%${word}%`;

            const byTitle = await this.documentsRepository.find({
                where: { title: ILike(pattern) },
                relations: ['files'],
            });

            const byText = await this.documentFilesRepository.find({
                where: { normalized_text: ILike(pattern) },
                relations: ['document'],
            });

            for (const doc of byTitle) {
                if (!seen.has(doc.id)) { seen.add(doc.id); results.push(doc); }
            }
            for (const f of byText) {
                if (f.document && !seen.has(f.document.id)) {
                    seen.add(f.document.id);
                    results.push(f.document);
                }
            }

            if (results.length >= 5) break;
        }

        return results.slice(0, 5);
    }

    // Вспомогательные методы 
    async findall(): Promise<Documents[]> {
        return await this.documentsRepository.find({ relations: ['files'] });
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