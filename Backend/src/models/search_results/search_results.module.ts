import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchResults } from './search_results.entity';
import { SearchResultsController } from './search_results.controller';
import { SearchResultsService } from './search_results.service';

@Module({
  imports: [TypeOrmModule.forFeature([SearchResults])],
  providers: [SearchResultsService],
  controllers: [SearchResultsController],
  exports: [SearchResultsService]
})
export class SearchResultsModule {}
