import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Documents } from '../../models/documents/documents.entity';
import { SearchQueries } from '../history/entities/search_queries.entity';
import { Users } from '../../models/users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Documents, SearchQueries, Users])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}