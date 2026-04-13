import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Embeddings } from './embeddings.entity';

@Injectable()
export class EmbeddingsService {
    constructor(
        @InjectRepository(Embeddings)
        private readonly embeddingsRepository: Repository<Embeddings>,
    ) {}

    async findall(): Promise<Embeddings[]> {
        return await this.embeddingsRepository.find();
    }
}