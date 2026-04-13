import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentChunks } from './document_chunks.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DocumentChunksService {
    constructor (
        @InjectRepository(DocumentChunks)
        private readonly documentChunksRepository: Repository<DocumentChunks>
    ) {}

    async findall(): Promise<DocumentChunks[]> {
        return await this.documentChunksRepository.find();
    }
 }
