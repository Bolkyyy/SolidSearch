// documents.controller.ts
import { Controller, Get, Post, Param, ParseIntPipe, UseInterceptors, UploadedFile, Body} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentService) {}

    @Get()
    async findAll() {
        return await this.documentsService.findall();
    }

    @Get(':id')
    async findbyid(@Param('id', ParseIntPipe) id: number) {
        return await this.documentsService.findbyid(id);
    }

    // POST /documents/upload
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
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
                : cb(new Error(`Формат не поддерживается`), false);
        },
    }))
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadDocumentDto,
    ) {
        return await this.documentsService.uploadDocument(file, dto);
    }

    // POST /documents/:id/extract-text
    @Post(':id/extract-text')
    async extractText(@Param('id', ParseIntPipe) id: number) {
        return await this.documentsService.extractText(id);
    }
}