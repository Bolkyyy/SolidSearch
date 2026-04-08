import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentSources } from './document_sources.entity';

@Injectable()
export class DocumentSourcesService {
    constructor(
        @InjectRepository(DocumentSources)
        private readonly documentsSourcesRepository: Repository<DocumentSources>
    ) {}

    async findall(): Promise<DocumentSources[]> {
        return await this.documentsSourcesRepository.find();
    }
}
