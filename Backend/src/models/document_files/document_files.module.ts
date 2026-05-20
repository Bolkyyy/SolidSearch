import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentFiles } from './document_files.entity';
import { DocumentFilesService } from './document_files.service';
import { DocumentFilesController } from './document_files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { Documents } from '../documents/documents.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentFiles, Documents]),
    MulterModule.register({ dest: './uploads' }),
  ],
  providers: [DocumentFilesService],
  controllers: [DocumentFilesController],
  exports: [DocumentFilesService]
})
export class DocumentFilesModule {}
