import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documents } from './documents.entity';
import { DocumentFilesService } from './documents.service';
import { DocumentsController } from './documents.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Documents])],
  providers: [DocumentFilesService],
  controllers: [DocumentsController],
  exports: [DocumentFilesService]
})
export class DocumentsModule {}
