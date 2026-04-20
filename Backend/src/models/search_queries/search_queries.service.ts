import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchQueries } from './search_queries.entity'

@Injectable()
export class SearchQueriesService {
    constructor(
        @InjectRepository(SearchQueries)
        private readonly searchQueriesRepository: Repository<SearchQueries>,
    ) {}

    async findall(): Promise<SearchQueries[]> {
        return await this.searchQueriesRepository.find();
    }
}