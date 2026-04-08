import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchQuerie } from './search_queries.entity'

@Injectable()
export class SearchQueriesService {
    constructor(
        @InjectRepository(SearchQuerie)
        private readonly searchQueriesRepository: Repository<SearchQuerie>,
    ) {}

    async findall(): Promise<SearchQuerie[]> {
        return await this.searchQueriesRepository.find();
    }
}