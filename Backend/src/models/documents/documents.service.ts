// documents.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Documents } from './documents.entity';
import { DocumentFiles } from '../document_files/document_files.entity';
import { UploadDocumentDto } from './dto/upload-document.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import WordExtractor from 'word-extractor';
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');

@Injectable()
export class DocumentService {
    constructor(
        @InjectRepository(Documents)
        private readonly documentsRepository: Repository<Documents>,

        @InjectRepository(DocumentFiles)
        private readonly documentFilesRepository: Repository<DocumentFiles>,
    ) {}

    // Существующие
    async findall(): Promise<Documents[]> {
        return await this.documentsRepository.find({ relations: ['files'] });
    }

    async findbyid(id: number): Promise<Documents> {
        const document = await this.documentsRepository.findOne({
            where: { id },
            relations: ['files'],
        });
        if (!document) throw new NotFoundException(`Document ${id} not found`);
        return document;
    }

    // POST /documents/upload 
    async uploadDocument(
        file: Express.Multer.File,
        dto: UploadDocumentDto,
    ): Promise<{ document: Documents; file: DocumentFiles }> {

        // 1. Создание записи в documents
        const document = await this.documentsRepository.save({
            collection_id: dto.collection_id ?? 1,
            title: dto.title ?? file.originalname,
            document_type: this.getDocumentType(file.mimetype),
            archive_number: dto.archive_number ?? '',
            document_date: new Date(),
            author_name: dto.author_name ?? '',
            status: 'uploaded',
            language: dto.language ?? 'ru',
        });

        // 2. Создание записи в document_files
        const documentFile = await this.documentFilesRepository.save({
            document_id: document.id,
            file_name: file.originalname,
            file_type: file.mimetype,
            file_path: file.path,
            file_size: file.size,
            extraction_status: 'pending',
        });

        return { document, file: documentFile };
    }

    // POST /documents/:id/extract-text
    async extractText(documentId: number): Promise<DocumentFiles[]> {
        const files = await this.documentFilesRepository.find({
            where: { document_id: documentId },
        });

        if (!files.length) throw new NotFoundException('Файлы не найдены');

        const results: DocumentFiles[] = [];

        for (const file of files) {
            try {
                const fullPath = path.resolve(file.file_path);
                const text = await this.extractTextFromFile(fullPath, file.file_type);
                const normalized = this.normalizeText(text);

                await this.documentFilesRepository.update(file.id, {
                    extracted_text: text,
                    normalized_text: normalized,
                    extraction_status: 'processed',
                });

                results.push({ ...file, extracted_text: text, normalized_text: normalized });
            } catch (e) {
                console.error(`[EXTRACT ERROR] file_id: ${file.id}`, e); 
                await this.documentFilesRepository.update(file.id, {
                    extraction_status: 'failed',
                });
            }
        }

        // Обновление статуса документа
        await this.documentsRepository.update(documentId, { status: 'processed' });

        return results;
    }

    // Поиск по title + normalized_text (для AiService)
    async searchDocuments(query: string): Promise<Documents[]> {
        const normalized = this.normalizeText(query);
        const words = normalized.split(' ').filter(w => w.length > 3);

        const results: Documents[] = [];

        for (const word of words) {
            // Поиск в заголовках документов
            const byTitle = await this.documentsRepository.find({
                where: { title: Like(`%${word}%`) },
                relations: ['files'],
            });

            // Поиск в тексте файлов
            const byText = await this.documentFilesRepository.find({
                where: { normalized_text: Like(`%${word}%`) },
                relations: ['document'],
            });

            results.push(...byTitle);
            results.push(...byText.map(f => f.document));
        }

        // Убирает дубликаты
        return Array.from(new Map(results.map(d => [d.id, d])).values()).slice(0, 10);
    }

    // Приватные
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

            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':{
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

    private normalizeText(text: string): string {
        return text
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[^\wа-яё\s]/gi, ' ')
            .trim();
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