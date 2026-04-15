import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchResults } from './search_results.entity';


@Injectable()
export class SearchResultsService {
    constructor(
        @InjectRepository(SearchResults)
        private readonly searchResultsRepository: Repository<SearchResults>,
    ) {}

    async findall(): Promise<SearchResults[]> {
        return await this.searchResultsRepository.find();
    }
}