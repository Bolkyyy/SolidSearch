import { Controller, Get, Post, Param, ParseIntPipe, UseInterceptors, UploadedFile, Body, Query, Res, NotFoundException } from '@nestjs/common';
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
  async findAll(@Query('collection_id') collectionId?: string) {
    if (collectionId !== undefined) {
      return await this.documentsService.findByCollectionId(Number(collectionId));
    }
    return await this.documentsService.findall();
  }

  @Get('sizes')
  async getCollectionSizes() {
    return await this.documentsService.getCollectionSizes();
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

  @Post('extract-all')
  async extractAll() {
    return await this.documentsService.extractAllText();
  }

  @Post(':id/extract-text')
  async extractText(@Param('id', ParseIntPipe) id: number) {
    return await this.documentsService.extractText(id);
  }
}
