import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentCollection } from './document_collection.entity';

@Injectable()
export class DocumentCollectionService {
  constructor(
    @InjectRepository(DocumentCollection)
    private readonly documentCollectionRepository: Repository<DocumentCollection>,
  ) {}

  async findall(): Promise<DocumentCollection[]> {
    return await this.documentCollectionRepository.find({ order: { id: 'ASC' } });
  }

  async create(dto: Partial<DocumentCollection>): Promise<DocumentCollection> {
    const collection = this.documentCollectionRepository.create(dto);
    return await this.documentCollectionRepository.save(collection);
  }

  async update(id: number, dto: Partial<DocumentCollection>): Promise<DocumentCollection> {
    await this.documentCollectionRepository.update(id, dto);
    return this.documentCollectionRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.documentCollectionRepository.delete(id);
  }
}
