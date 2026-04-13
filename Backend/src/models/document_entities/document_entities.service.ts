import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentEntities } from './document_entities.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DocumentEntitiesService {
    constructor (
        @InjectRepository(DocumentEntities)
        private readonly documentEntitiesRepository: Repository<DocumentEntities>,
    ) {}

    async findall(): Promise<DocumentEntities[]> {
        return this.documentEntitiesRepository.find();
    }
}
