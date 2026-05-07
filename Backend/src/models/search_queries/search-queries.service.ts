import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchQuery } from './search-query.entity';
import { CreateSearchQueryDto } from './dto/create-search-query.dto';

@Injectable()
export class SearchQueriesService {
  constructor(
    @InjectRepository(SearchQuery)
    private searchQueryRepository: Repository<SearchQuery>,
  ) {}

  async create(dto: CreateSearchQueryDto): Promise<SearchQuery> {
    const record = this.searchQueryRepository.create({
      userId: dto.user_id,
      queryText: dto.query_text,
    });
    return this.searchQueryRepository.save(record);
  }
}