import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { SearchQueriesController } from './search_queries.controller';
import { SearchQueriesService } from './search_queries.service';
import { SearchQueries } from './search_queries.entity'

@Module({
  imports: [TypeOrmModule.forFeature([SearchQueries])],
  controllers: [SearchQueriesController],
  providers: [SearchQueriesService],
  exports: [SearchQueriesService]
})
export class SearchQueriesModule {}
