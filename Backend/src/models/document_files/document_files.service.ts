import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentFiles } from './document_files.entity';
import { Documents } from '../documents/documents.entity';
import * as fs from 'fs';
import * as path from 'path';
const pdfParse = require('pdf-parse');
import * as mammoth from 'mammoth';

@Injectable()
export class DocumentFilesService {
  constructor(
    @InjectRepository(DocumentFiles)
    private readonly documentFilesRepository: Repository<DocumentFiles>,

    @InjectRepository(Documents)
    private readonly documentsRepository: Repository<Documents>,
  ) {}

  async findall(): Promise<DocumentFiles[]> {
    return await this.documentFilesRepository.find();
  }

  async uploadFile(file: Express.Multer.File): Promise<{ document: Documents; documentFile: DocumentFiles }> {
    const ext = getExtname(file.originalname).replace('.', '').toUpperCase();

    const document = this.documentsRepository.create({
      title: file.originalname,
      collection_id: 1,
      document_type: ext,
      archive_number: `AUTO-${Date.now()}`,
      document_date: new Date(),
      author_name: 'Загружено вручную',
      status: 'pending',
      language: 'ru',
    });
    const savedDocument = await this.documentsRepository.save(document);

    await new Promise((resolve) => setTimeout(resolve, 300));

    let savedFile: DocumentFiles | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const documentFile = this.documentFilesRepository.create({
          document_id: savedDocument.id,
          file_name: file.originalname,
          file_type: ext,
          file_path: file.path,
          file_size: file.size,
          page_count: 0,
        });
        savedFile = await this.documentFilesRepository.save(documentFile);
        break;
      } catch (err) {
        if (attempt === 3) throw err;
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }

    return { document: savedDocument, documentFile: savedFile! };
  }

  async extractText(id: number): Promise<{ text: string }> {
    const documentFile = await this.documentFilesRepository.findOne({ where: { id } });
    if (!documentFile) {
      throw new NotFoundException(`DocumentFile with id ${id} not found`);
    }

    const filePath = path.resolve(documentFile.file_path);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File not found on disk: ${filePath}`);
    }

    const ext = documentFile.file_type.toLowerCase();
    let text = '';

    if (ext === 'pdf') {
      const buffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else if (ext === 'docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (ext === 'txt') {
      text = fs.readFileSync(filePath, 'utf-8');
    } else {
      text = `Извлечение текста для формата ${ext} не поддерживается`;
    }

    return { text };
  }
}

function getExtname(originalname: string): string {
  const parts = originalname.split('.');
  return parts.length > 1 ? '.' + parts.pop() : '';
}