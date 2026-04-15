import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentPages } from './document_pages.entity';

@Injectable()
export class DocumentPagesService {
    constructor(
        @InjectRepository(DocumentPages)
        private readonly documentPagesRepository: Repository<DocumentPages>,
    ) {}

    async findall(): Promise<DocumentPages[]> {
        return await this.documentPagesRepository.find();
    }
}