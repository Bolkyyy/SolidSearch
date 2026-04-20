import { Module } from '@nestjs/common';
import { SearchResultsService } from './search_results.service';

@Module({
  providers: [SearchResultsService]
})
export class SearchResultsModule {}
