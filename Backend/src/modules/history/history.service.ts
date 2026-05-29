import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { SearchQueries } from './entities/search_queries.entity';

@Injectable()
export class HistoryService {
  private recentKeys = new Map<string, number>();

  constructor(
    @InjectRepository(SearchQueries)
    private readonly searchQueriesRepository: Repository<SearchQueries>,
  ) {}

  async create(dto: CreateHistoryDto) {
    const dedupeKey = `${dto.user_id}:${dto.query_text}`;
    const now = Date.now();
    const last = this.recentKeys.get(dedupeKey);
    if (last && now - last < 10_000) {
      return null;
    }
    this.recentKeys.set(dedupeKey, now);

    if (this.recentKeys.size > 500) {
      for (const [k, t] of this.recentKeys) {
        if (now - t > 30_000) this.recentKeys.delete(k);
      }
    }

    const post = this.searchQueriesRepository.create(dto);
    return this.searchQueriesRepository.save(post);
  }

  async findAll(limit = 20) : Promise<SearchQueries[]> {
    return await this.searchQueriesRepository.find({
      order: { created_at: 'DESC' },
      take: limit,
    });
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

  async deleteById(id: number): Promise<{ deleted: number }> {
    const result = await this.searchQueriesRepository.delete({ id: +id });
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