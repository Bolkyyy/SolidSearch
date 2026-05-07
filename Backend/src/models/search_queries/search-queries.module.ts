import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchQueriesService } from './search-queries.service';
import { SearchQueriesController } from './search-queries.controller';
import { SearchQuery } from './search-query.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SearchQuery])],
  controllers: [SearchQueriesController],
  providers: [SearchQueriesService],
})
export class SearchQueriesModule {}