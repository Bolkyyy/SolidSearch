import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entities } from './entities.entity';

@Injectable()
export class EntitiesService {
    constructor(
        @InjectRepository(Entities)
        private readonly entitiesRepository: Repository<Entities>,
    ) {}

    async findall(): Promise<Entities[]> {
        return await this.entitiesRepository.find();
    }
}