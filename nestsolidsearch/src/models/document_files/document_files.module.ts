import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentFiles } from './document_files.entity';
import { DocumentFilesService } from './document_files.service';
import { DocumentFilesController } from './document_files.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentFiles])],
  providers: [DocumentFilesService],
  controllers: [DocumentFilesController],
  exports: [DocumentFilesService]
})
export class DocumentFilesModule {}
