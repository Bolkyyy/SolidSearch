import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documents } from '../../models/documents/documents.entity';
import { SearchQueries } from '../history/entities/search_queries.entity';
import { IndexJobs } from '../../models/index_jobs/index_jobs.entity';
import { Users } from '../../models/users/users.entity';

export interface DashboardData {
  totalDocuments: number;
  totalDocumentsToday: number;
  totalIndexed: number;
  totalIndexedToday: number;
  totalSearch: number;
  totalSearchToday: number;
  totalActiveUsers: number;
  totalNewUsers: number;
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
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) { }

  async getSearchData(countDays: number = 30): Promise<any> {
    const results = await this.searchQuerieRepository.createQueryBuilder("entity")
      .select("DATE(entity.created_at)", "date")
      .addSelect("COUNT(*)", "count")
      .where("entity.created_at >= :DaysAgo", { DaysAgo: new Date(new Date().setDate(new Date().getDate() - countDays)) })
      .groupBy("date")
      .orderBy("date", "ASC")
      .getRawMany();
    return results
  }

  async getDashboardData(): Promise<DashboardData> {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const dateNewUsers = new Date();
    dateNewUsers.setDate(dateNewUsers.getDate() - 7);
    dateNewUsers.setHours(0, 0, 0, 0);

    const [
      totalDocuments,
      totalDocumentsToday,
      totalIndexed,
      totalIndexedToday,
      totalSearch,
      totalSearchToday,
      totalActiveUsers,
      totalNewUsers,
    ] = await Promise.all([
      this.documentsRepository.count(),
      this.documentsRepository
        .createQueryBuilder('document')
        .where('document.created_at >= :todayDate', { todayDate })
        .getCount(),
      this.indexJobsRepository
        .createQueryBuilder('job')
        .select('COUNT(DISTINCT job.document_id)', 'count')
        .where('job.status = :status', { status: 'completed' })
        .getRawOne<{ count: string }>()
        .then((res) => Number(res?.count ?? 0)),
      this.indexJobsRepository
        .createQueryBuilder('job')
        .where('job.finished_at >= :todayDate', { todayDate })
        .getCount(),
      this.searchQuerieRepository.count(),
      this.searchQuerieRepository
        .createQueryBuilder('query')
        .where('query.created_at >= :todayDate', { todayDate })
        .getCount(),
      this.usersRepository.count({ where: { status: 'active' } }),
      this.usersRepository
        .createQueryBuilder('user')
        .where('user.created_at >= :dateNewUsers', { dateNewUsers })
        .getCount(),
    ]);

    return {
      totalDocuments,
      totalDocumentsToday,
      totalIndexed,
      totalIndexedToday,
      totalSearch,
      totalSearchToday,
      totalActiveUsers,
      totalNewUsers,
    };
  }
}
