import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { SearchQueries } from './entities/search_queries.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SearchQueries])],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService]

})
export class HistoryModule {}
