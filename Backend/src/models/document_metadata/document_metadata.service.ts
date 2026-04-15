import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentMetadata } from './document_metadata.entity';

@Injectable()
export class DocumentMetadataService {
    constructor(
        @InjectRepository(DocumentMetadata)
        private readonly documentMetadataRepository: Repository<DocumentMetadata>,
    ) {}

    async findall(): Promise<DocumentMetadata[]> {
        return await this.documentMetadataRepository.find();
    }
}
