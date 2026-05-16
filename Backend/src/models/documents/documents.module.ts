// documents.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentService } from './documents.service';
import { Documents } from './documents.entity';
import { DocumentFiles } from '../document_files/document_files.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Documents, DocumentFiles])],
    controllers: [DocumentsController],
    providers: [DocumentService],
    exports: [DocumentService],
})
export class DocumentsModule {}