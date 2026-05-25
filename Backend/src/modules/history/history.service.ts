import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchQueries } from './entities/search_queries.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(SearchQueries)
    private readonly searchQueriesRepository: Repository<SearchQueries>,
  ) {}
  
  async create(dto: CreateHistoryDto) {
    const post = this.searchQueriesRepository.create(dto);
    return this.searchQueriesRepository.save(post);
  }

  async findAll() : Promise<SearchQueries[]> {
    return await this.searchQueriesRepository.find();
  }

  async findAllById(user_id: number) {
    return this.searchQueriesRepository.find({
      where: { user_id: +user_id}
    })
  }
  
  async findByQueryText(queryText: string): Promise<SearchQueries | null> {
  return await this.searchQueriesRepository.findOne({
    where: {
      query_text: queryText,
      query_type: 'ai',
    },
    order: { created_at: 'DESC' },
  });
}
}