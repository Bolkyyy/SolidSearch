import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { SearchQueries } from './entities/search_queries.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(SearchQueries)
    private readonly searchQueriesRepository: Repository<SearchQueries>,
  ) {}
  
  async create(dto: CreateHistoryDto) {
    if (dto.user_id && dto.query_text) {
      const recent = await this.searchQueriesRepository.findOne({
        where: {
          user_id: dto.user_id,
          query_text: dto.query_text,
          created_at: MoreThan(new Date(Date.now() - 10_000)),
        },
      });
      if (recent) return recent;
    }
    const post = this.searchQueriesRepository.create(dto);
    return this.searchQueriesRepository.save(post);
  }

  async findAll() : Promise<SearchQueries[]> {
    return await this.searchQueriesRepository.find();
  }

  async findAllById(user_id: number) {
    return this.searchQueriesRepository.find({
      where: { user_id: +user_id },
      order: { created_at: 'DESC' },
    });
  }
  
  async clearByUserId(user_id: number): Promise<{ deleted: number }> {
    const result = await this.searchQueriesRepository.delete({ user_id: +user_id });
    return { deleted: result.affected ?? 0 };
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