import { Controller, Get, Post, Delete, Param, ParseIntPipe, UseInterceptors, UploadedFile, Body, Query, Res, NotFoundException, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, resolve, basename } from 'path';
import { Response } from 'express';
import { DocumentService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentService) {}

  @Get()
  async findAll(
    @Query('collection_id') collectionId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('user_id') userId?: string,
  ) {
    if (collectionId !== undefined) {
      return await this.documentsService.findByCollectionId(
        Number(collectionId),
        Number(page) || 1,
        Number(limit) || 20,
        search,
        type,
      );
    }
    return await this.documentsService.findall(userId ? Number(userId) : undefined, limit ? Number(limit) : undefined);
  }

  @Get('indexing-config')
  getIndexingConfig() {
    return this.documentsService.getIndexingConfig();
  }

  @Put('indexing-config')
  updateIndexingConfig(@Body() dto: { chunkSize?: number; chunkMaxTokens?: number; maxStoredChars?: number; maxAiChars?: number }) {
    return this.documentsService.updateIndexingConfig(dto);
  }

  @Get('sizes')
  async getCollectionSizes() {
    return await this.documentsService.getCollectionSizes();
  }

  @Get('stats')
  async getCollectionStats(@Query('collection_id') collectionId: string) {
    return await this.documentsService.getCollectionStats(Number(collectionId));
  }

  @Get(':id/jobs')
  async getDocumentJobs(@Param('id', ParseIntPipe) id: number) {
    return await this.documentsService.getDocumentJobs(id);
  }

  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const doc = await this.documentsService.findbyid(id);
    const file = doc.files?.[0];
    if (!file?.file_path) throw new NotFoundException('Файл не найден');
    const fullPath = resolve(file.file_path);
    const fileName = file.file_name || basename(fullPath);
    res.download(fullPath, fileName, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ message: 'Ошибка при скачивании' });
      }
    });
  }

  @Get(':id')
  async findbyid(@Param('id', ParseIntPipe) id: number) {
    return await this.documentsService.findbyid(id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
          cb(null, unique + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExts = new Set([
          '.pdf', '.docx', '.doc', '.txt',
          '.png', '.jpg', '.jpeg', '.tiff', '.tif', '.webp',
          '.xls', '.xlsx',
          '.ppt', '.pptx',
          '.rtf',
          '.md', '.markdown',
          '.csv',
          '.ods',
        ]);
        const ext = extname(file.originalname).toLowerCase();
        allowedExts.has(ext)
          ? cb(null, true)
          : cb(new Error('Формат не поддерживается'), false);
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    return await this.documentsService.uploadDocument(file, dto);
  }

  @Post(':id/add-to-collection')
  async addToCollection(
    @Param('id', ParseIntPipe) id: number,
    @Body('collection_id') collectionId: number,
  ) {
    return await this.documentsService.setCollectionId(
      id,
      collectionId === 0 ? null : Number(collectionId),
    );
  }

  @Delete(':id')
  async deleteDocument(@Param('id', ParseIntPipe) id: number) {
    return await this.documentsService.deleteDocument(id);
  }

  @Get('collection/:collectionId/manifest')
  async getCollectionManifest(@Param('collectionId', ParseIntPipe) collectionId: number) {
    const files = await this.documentsService.getCollectionFiles(collectionId);
    return {
      total: files.length,
      found: files.filter((f) => !f.missing).length,
      missing: files.filter((f) => f.missing).length,
      items: files,
    };
  }

  @Get('collection/:collectionId/download')
  async downloadCollection(
    @Param('collectionId', ParseIntPipe) collectionId: number,
    @Res() res: Response,
  ) {
    try {
      const files = await this.documentsService.getCollectionFiles(collectionId);
      const found = files.filter((f) => !f.missing);
      const missing = files.filter((f) => f.missing);

      if (found.length === 0) {
        res.status(404).json({ message: 'Нет файлов для скачивания' });
        return;
      }

      const AdmZip = require('adm-zip');
      const zip = new AdmZip();

      for (const f of found) {
        zip.addLocalFile(f.filePath, '', f.fileName);
      }

      if (missing.length > 0) {
        const lines = [
          `Не найдено файлов: ${missing.length} из ${files.length}`,
          '',
          ...missing.map((f) => `- ${f.docTitle || f.fileName}`),
        ];
        zip.addFile('_missing_files.txt', Buffer.from(lines.join('\n'), 'utf8'));
      }

      const buffer = zip.toBuffer();
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="collection_${collectionId}.zip"`);
      res.setHeader('Content-Length', buffer.length);
      res.end(buffer);
    } catch (err: any) {
      console.error('[DOWNLOAD COLLECTION]', err);
      if (!res.headersSent) res.status(500).json({ message: err.message });
    }
  }

  @Post('extract-all')
  async extractAll() {
    return await this.documentsService.extractAllText();
  }

  @Post('extract-collection/:collectionId')
  async extractCollection(@Param('collectionId', ParseIntPipe) collectionId: number) {
    return await this.documentsService.extractCollectionText(collectionId);
  }

  @Get('extract-collection/:collectionId/status')
  getReindexStatus(@Param('collectionId', ParseIntPipe) collectionId: number) {
    return { active: this.documentsService.isReindexActive(collectionId) };
  }

  @Post('extract-collection/:collectionId/cancel')
  async cancelExtractCollection(@Param('collectionId', ParseIntPipe) collectionId: number) {
    this.documentsService.cancelCollectionReindex(collectionId);
    return { message: 'Отмена переиндексации запрошена' };
  }

  @Post(':id/extract-text')
  async extractText(@Param('id', ParseIntPipe) id: number) {
    return await this.documentsService.extractText(id);
  }
}
