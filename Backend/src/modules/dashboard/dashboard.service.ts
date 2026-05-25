import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documents } from '../../models/documents/documents.entity'; 
import { SearchQueries } from '../history/entities/search_queries.entity';
import { IndexJobs } from '../../models/index_jobs/index_jobs.entity';

export interface DashboardData {
  totalDocuments: number;
  totalDocumentsToday: number;
  totalIndexed: number;
  totalIndexedToday: number;
  totalSearch: number;
  totalSearchToday: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Documents)
    private readonly documentsRepository: Repository<Documents>,
    @InjectRepository(IndexJobs)
    private readonly indexJobsRepository: Repository<IndexJobs>,
    @InjectRepository(SearchQueries)
    private readonly searchQuerieRepository: Repository<SearchQueries>,
  ) {}

  async getDashboardData(): Promise<DashboardData> {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const [
      totalDocuments,
      totalDocumentsToday,
      totalIndexed,
      totalIndexedToday,
      totalSearch,
      totalSearchToday,
    ] = await Promise.all([
      // 1. Всего документов
      this.documentsRepository.count(),

      // 2. Документов за сегодня
      this.documentsRepository
        .createQueryBuilder('document')
        .where('document.created_at >= :todayDate', { todayDate })
        .getCount(),

      // 3. Всего проиндексированных документов
      this.indexJobsRepository
        .createQueryBuilder('job')
        .select('COUNT(DISTINCT job.document_id)', 'count')
        .where('job.status = :status', { status: 'completed' })
        .getRawOne<{ count: string }>()
        .then(res => Number(res?.count)),

      // 4. Завершённых задач индексации за сегодня
      this.indexJobsRepository
        .createQueryBuilder('job')
        .where('job.finished_at >= :todayDate', { todayDate })
        .getCount(),

      // 5. Всего поисковых запросов
      this.searchQuerieRepository.count(),

      // 6. Поисковых запросов за сегодня
      this.searchQuerieRepository
        .createQueryBuilder('query')
        .where('query.created_at >= :todayDate', { todayDate })
        .getCount(),
    ]);

    return {
      totalDocuments,
      totalDocumentsToday,
      totalIndexed,
      totalIndexedToday,
      totalSearch,
      totalSearchToday,
    };
  }
}