import { Controller, Get, Post, Param, ParseIntPipe, UploadedFile, UseInterceptors, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentFilesService } from './document_files.service';

@Controller('document_files')
export class DocumentFilesController {
  constructor(private readonly documentsService: DocumentFilesService) {}

  @Get()
  async findall() {
    return await this.documentsService.findall();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    return await this.documentsService.uploadFile(file);
  }


  @Post(':id/extract')
  async extractText(@Param('id', ParseIntPipe) id: number) {
    return await this.documentsService.extractText(id);
  }
}