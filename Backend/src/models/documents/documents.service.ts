import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ReturnDocument } from 'typeorm';
import { Documents } from './documents.entity';

@Injectable()
export class DocumentFilesService {
    constructor(
        @InjectRepository(Documents)
        private readonly documentsRepository: Repository<Documents>,
    ) {}

    async findall(): Promise<Documents[]> {
        return await this.documentsRepository.find();
    }

    async findbyid(id: number): Promise<Documents> {
        const document = await this.documentsRepository.findOne({ where: { id } });
        if (!document) {
            throw new NotFoundException(`Document with id ${id} not found`);
        }
        return document;
    }
}