import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentFiles } from './document_files.entity';

@Injectable()
export class DocumentFilesService {
    constructor(
        @InjectRepository(DocumentFiles)
        private readonly documentFilesRepository: Repository<DocumentFiles>,
    ) {}

    async findall(): Promise<DocumentFiles[]> {
        return await this.documentFilesRepository.find();
    }
}
