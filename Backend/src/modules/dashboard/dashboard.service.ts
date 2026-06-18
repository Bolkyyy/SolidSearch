import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documents } from '../../models/documents/documents.entity';
import { SearchQueries } from '../history/entities/search_queries.entity';
import { Users } from '../../models/users/users.entity';

export interface DashboardData {
  totalDocuments: number;
  totalDocumentsToday: number;
  totalIndexed: number;
  totalIndexedToday: number;
  totalFailed: number;
  totalSearch: number;
  totalSearchToday: number;
  totalSearchYesterday: number;
  avgResponseTimeSec: number | null;
  avgResponseTimeSecPrev: number | null;
  totalActiveUsers: number;
  totalNewUsers: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Documents)
    private readonly documentsRepository: Repository<Documents>,
    @InjectRepository(SearchQueries)
    private readonly searchQuerieRepository: Repository<SearchQueries>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) { }

  async getSearchesByHour(countDays: number = 30): Promise<any> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - countDays);
    return this.searchQuerieRepository.manager.query(
      `SELECT EXTRACT(HOUR FROM (created_at + INTERVAL '3 hours')) as hour, COUNT(*) as count
       FROM solidsearchdb.search_queries
       WHERE created_at >= $1
       GROUP BY hour ORDER BY hour ASC`,
      [daysAgo],
    );
  }

  async getSearchesByWeekday(countDays: number = 30): Promise<any> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - countDays);
    return this.searchQuerieRepository.manager.query(
      `SELECT EXTRACT(DOW FROM (created_at + INTERVAL '3 hours')) as dow, COUNT(*) as count
       FROM solidsearchdb.search_queries
       WHERE created_at >= $1
       GROUP BY dow ORDER BY dow ASC`,
      [daysAgo],
    );
  }

  async getDocumentIndexingByWeekday(countDays: number = 30): Promise<any> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - countDays);
    return this.documentsRepository.manager.query(
      `SELECT EXTRACT(DOW FROM (created_at + INTERVAL '3 hours')) as dow, COUNT(*) as count
       FROM solidsearchdb.documents
       WHERE created_at >= $1 AND status = 'processed'
       GROUP BY dow ORDER BY dow ASC`,
      [daysAgo],
    );
  }

  async getTopUsers(countDays: number = 30, limit: number = 8): Promise<any> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - countDays);
    return this.searchQuerieRepository.manager.query(
      `SELECT COALESCE(u.full_name, u.email, 'Аноним') as name, COUNT(*) as count
       FROM solidsearchdb.search_queries sq
       LEFT JOIN solidsearchdb.users u ON sq.user_id = u.id
       WHERE sq.created_at >= $1
       GROUP BY u.id, u.full_name, u.email
       ORDER BY count DESC
       LIMIT $2`,
      [daysAgo, limit],
    );
  }

  async getSearchSuccessRate(countDays: number = 30): Promise<any> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - countDays);
    return this.searchQuerieRepository.manager.query(
      `SELECT DATE(created_at)::text as date,
              ROUND(100.0 * SUM(CASE WHEN result_count > 0 THEN 1 ELSE 0 END) / COUNT(*), 1) as rate
       FROM solidsearchdb.search_queries
       WHERE created_at >= $1
       GROUP BY date ORDER BY date ASC`,
      [daysAgo],
    );
  }

  async getAvgSuccessRate(countDays: number = 30): Promise<{ rate: number | null; prevRate: number | null }> {
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - countDays);
    const prevStart = new Date(periodStart);
    prevStart.setDate(prevStart.getDate() - countDays);

    const [cur, prev] = await Promise.all([
      this.searchQuerieRepository.manager.query(
        `SELECT ROUND(100.0 * SUM(CASE WHEN result_count > 0 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) as rate
         FROM solidsearchdb.search_queries WHERE created_at >= $1`,
        [periodStart],
      ),
      this.searchQuerieRepository.manager.query(
        `SELECT ROUND(100.0 * SUM(CASE WHEN result_count > 0 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) as rate
         FROM solidsearchdb.search_queries WHERE created_at >= $1 AND created_at < $2`,
        [prevStart, periodStart],
      ),
    ]);

    return {
      rate: cur[0]?.rate != null ? parseFloat(cur[0].rate) : null,
      prevRate: prev[0]?.rate != null ? parseFloat(prev[0].rate) : null,
    };
  }

  async getQueryTypes(countDays: number = 30): Promise<any> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - countDays);
    return this.searchQuerieRepository.manager.query(
      `SELECT COALESCE(query_type, 'Не указан') as type, COUNT(*) as count
       FROM solidsearchdb.search_queries
       WHERE created_at >= $1
       GROUP BY query_type ORDER BY count DESC`,
      [daysAgo],
    );
  }

  async getAvgResultCount(countDays: number = 30): Promise<any> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - countDays);
    return this.searchQuerieRepository.manager.query(
      `SELECT DATE(created_at)::text as date, ROUND(AVG(result_count)::numeric, 1) as avg_results
       FROM solidsearchdb.search_queries
       WHERE result_count IS NOT NULL AND created_at >= $1
       GROUP BY date ORDER BY date ASC`,
      [daysAgo],
    );
  }

  async getResponseTimeData(countDays: number = 30): Promise<any> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - countDays);
    return this.searchQuerieRepository.manager.query(
      `SELECT DATE(created_at)::text as date, ROUND(AVG(response_time_ms)::numeric, 0) as avg_ms
       FROM solidsearchdb.search_queries
       WHERE response_time_ms IS NOT NULL AND created_at >= $1
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [daysAgo],
    );
  }

  async getTopQueries(countDays: number = 30, limit: number = 8): Promise<any> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - countDays);
    return this.searchQuerieRepository.createQueryBuilder('q')
      .select('q.query_text', 'query')
      .addSelect('COUNT(*)', 'count')
      .where('q.query_text IS NOT NULL')
      .andWhere("q.query_text != ''")
      .andWhere('q.created_at >= :daysAgo', { daysAgo })
      .groupBy('q.query_text')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getDocumentIndexingData(countDays: number = 30): Promise<any> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - countDays);
    return this.documentsRepository.createQueryBuilder('doc')
      .select('DATE(doc.created_at)::text', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('doc.created_at >= :daysAgo', { daysAgo })
      .andWhere("doc.status = 'processed'")
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async getSearchData(countDays: number = 30): Promise<any> {
    const results = await this.searchQuerieRepository.createQueryBuilder("entity")
      .select("DATE(entity.created_at)::text", "date")
      .addSelect("COUNT(*)", "count")
      .where("entity.created_at >= :DaysAgo", { DaysAgo: new Date(new Date().setDate(new Date().getDate() - countDays)) })
      .groupBy("date")
      .orderBy("date", "ASC")
      .getRawMany();
    return results
  }

  async getDashboardData(): Promise<DashboardData> {
    const moscowOffset = 3 * 60 * 60 * 1000;
    const dayMs = 24 * 60 * 60 * 1000;
    const todayDate = new Date(
      Math.floor((Date.now() + moscowOffset) / dayMs) * dayMs - moscowOffset,
    );

    const yesterdayStart = new Date(todayDate.getTime() - dayMs);
    const yesterdayEnd = new Date(todayDate);

    const dateNewUsers = new Date();
    dateNewUsers.setDate(dateNewUsers.getDate() - 7);
    dateNewUsers.setHours(0, 0, 0, 0);

    const [
      totalDocuments,
      totalDocumentsToday,
      totalIndexed,
      totalIndexedToday,
      totalFailed,
      totalSearch,
      totalSearchToday,
      totalSearchYesterday,
      totalActiveUsers,
      totalNewUsers,
    ] = await Promise.all([
      this.documentsRepository.count(),
      this.documentsRepository
        .createQueryBuilder('document')
        .where('document.created_at >= :todayDate', { todayDate })
        .getCount(),
      this.documentsRepository.count({ where: { status: 'processed' } }),
      this.documentsRepository
        .createQueryBuilder('doc')
        .where('doc.status = :status', { status: 'processed' })
        .andWhere('doc.created_at >= :todayDate', { todayDate })
        .getCount(),
      this.documentsRepository.count({ where: { status: 'extraction_failed' } }),
      this.searchQuerieRepository.count(),
      this.searchQuerieRepository
        .createQueryBuilder('query')
        .where('query.created_at >= :todayDate', { todayDate })
        .getCount(),
      this.searchQuerieRepository
        .createQueryBuilder('query')
        .where('query.created_at >= :yesterdayStart', { yesterdayStart })
        .andWhere('query.created_at < :yesterdayEnd', { yesterdayEnd })
        .getCount(),
      this.usersRepository.count({ where: { status: 'active' } }),
      this.usersRepository
        .createQueryBuilder('user')
        .where('user.created_at >= :dateNewUsers', { dateNewUsers })
        .getCount(),
    ]);

    let avgMs: number | null = null;
    let avgMsPrev: number | null = null;
    try {
      const [allAvgRaw, prevAvgRaw] = await Promise.all([
        this.searchQuerieRepository.manager.query(
          `SELECT AVG(response_time_ms) as avg FROM solidsearchdb.search_queries WHERE response_time_ms IS NOT NULL`,
        ),
        this.searchQuerieRepository.manager.query(
          `SELECT AVG(response_time_ms) as avg FROM solidsearchdb.search_queries WHERE response_time_ms IS NOT NULL AND created_at < $1`,
          [todayDate],
        ),
      ]);
      const val = allAvgRaw?.[0]?.avg;
      const valPrev = prevAvgRaw?.[0]?.avg;
      avgMs = val != null ? parseFloat(val) : null;
      avgMsPrev = valPrev != null ? parseFloat(valPrev) : null;
    } catch {}

    return {
      totalDocuments,
      totalDocumentsToday,
      totalIndexed,
      totalIndexedToday,
      totalFailed,
      totalSearch,
      totalSearchToday,
      totalSearchYesterday,
      avgResponseTimeSec: avgMs != null ? Math.round(avgMs) / 1000 : null,
      avgResponseTimeSecPrev: avgMsPrev != null ? Math.round(avgMsPrev) / 1000 : null,
      totalActiveUsers,
      totalNewUsers,
    };
  }
}