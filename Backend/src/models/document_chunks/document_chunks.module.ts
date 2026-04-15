import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentChunks } from './document_chunks.entity';
import { DocumentChunksService } from './document_chunks.service';
import { DocumentChunksController } from './document_chunks.controller';

@Module({
    imports: [TypeOrmModule.forFeature([DocumentChunks])],
    providers: [DocumentChunksService],
    controllers: [DocumentChunksController],
    exports: [DocumentChunksService]
})
export class DocumentChunksModule {}
