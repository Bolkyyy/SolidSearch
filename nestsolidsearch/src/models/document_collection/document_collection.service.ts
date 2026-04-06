import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentCollection } from './document_collection.entity';

@Injectable()
export class DocumentCollectionService {
    constructor(
        @InjectRepository(DocumentCollection)
        private readonly documentFilesRepository: Repository<DocumentCollection>,
    ) {}

    async findall(): Promise<DocumentCollection[]> {
        return await this.documentFilesRepository.find();
    }
}
