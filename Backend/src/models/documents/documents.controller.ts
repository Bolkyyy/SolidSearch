import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Body,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentService) {}

  // GET /documents — все документы
  // GET /documents?collection_id=5 — документы конкретной коллекции
  @Get()
  async findAll(@Query('collection_id') collectionId?: string) {
    if (collectionId !== undefined) {
      return await this.documentsService.findByCollectionId(Number(collectionId));
    }
    return await this.documentsService.findall();
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
        const allowed = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'text/plain',
          'image/png',
          'image/jpeg',
          'image/tiff',
        ];
        allowed.includes(file.mimetype)
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

  // POST /documents/:id/add-to-collection  { collection_id: number | 0 }
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