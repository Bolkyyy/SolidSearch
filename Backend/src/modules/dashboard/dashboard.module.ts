import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { IndexJobs } from '../../models/index_jobs/index_jobs.entity';
import { Documents } from '../../models/documents/documents.entity';
import { SearchQueries } from '../../models/search_queries/search_queries.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IndexJobs, Documents, SearchQueries])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}