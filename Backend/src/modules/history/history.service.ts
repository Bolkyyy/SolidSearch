import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SearchQueries } from './entities/search_queries.entity';
import { AiAnswers } from '../ai/entity/ai-answer.entity';

@Injectable()
export class HistoryService {
  private recentKeys = new Map<string, number>();

  constructor(
    @InjectRepository(SearchQueries)
    private readonly searchQueriesRepository: Repository<SearchQueries>,

    @InjectRepository(AiAnswers)
    private readonly aiAnswersRepository: Repository<AiAnswers>,
  ) {}

  private normalizeFilters(filters?: any): Record<string, string> | null {
    if (!filters) return null;
    const result: Record<string, string> = {};
    if (filters.period && filters.period !== 'all') result.period = filters.period;
    if (filters.format && filters.format !== 'all') result.format = filters.format;
    if (filters.source && filters.source !== 'all') result.source = filters.source;
    return Object.keys(result).length > 0 ? result : null;
  }

  async create(dto: CreateHistoryDto) {
    const normalized = this.normalizeFilters(dto.filters_json);
    const dedupeKey = `${dto.user_id}:${dto.query_text}:${JSON.stringify(normalized)}`;
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

    const post = this.searchQueriesRepository.create({
      ...dto,
      filters_json: normalized,
    });
    return this.searchQueriesRepository.save(post);
  }

  async findAll() : Promise<SearchQueries[]> {
    return await this.searchQueriesRepository.find();
  }

  async findRecent(limit = 5): Promise<SearchQueries[]> {
    return this.searchQueriesRepository.find({
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
    const queries = await this.searchQueriesRepository.find({
      where: { user_id: +user_id },
      select: ['id'],
    });
    const ids = queries.map((q) => q.id);
    if (ids.length > 0) {
      await this.aiAnswersRepository.delete({ query_id: In(ids) });
    }
    const result = await this.searchQueriesRepository.delete({ user_id: +user_id });
    return { deleted: result.affected ?? 0 };
  }

  async deleteById(id: number): Promise<{ deleted: number }> {
    await this.aiAnswersRepository.delete({ query_id: +id });
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

  async findByQueryAndUser(
    queryText: string,
    userId: number,
    filters?: any,
  ): Promise<SearchQueries | null> {
    const normalized = this.normalizeFilters(filters);

    const qb = this.searchQueriesRepository
      .createQueryBuilder('sq')
      .where('LOWER(sq.query_text) = LOWER(:queryText)', { queryText: queryText.trim() })
      .andWhere('sq.user_id = :userId', { userId: +userId })
      .andWhere('sq.query_type = :type', { type: 'ai' });

    if (normalized === null) {
      qb.andWhere('sq.filters_json IS NULL');
    } else {
      qb.andWhere("sq.filters_json::text = :fj", {
        fj: JSON.stringify(normalized),
      });
    }

    return await qb.orderBy('sq.created_at', 'DESC').getOne();
  }
}