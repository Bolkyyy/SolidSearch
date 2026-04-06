import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documents } from './documents.entity';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectRepository(Documents)
        private readonly documentsRepository: Repository<Documents>,
    ) {}

    async findall(): Promise<Documents[]> {
        return await this.documentsRepository.find();
    }
}
