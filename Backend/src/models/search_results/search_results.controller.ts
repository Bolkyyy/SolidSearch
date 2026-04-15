import { Controller, Get } from '@nestjs/common';
import { SearchResultsService } from './search_results.service';

@Controller('search-results')
export class SearchResultsController {
    constructor(private readonly searchResultsService: SearchResultsService) {}

    @Get()
    async findall() {
        return await this.searchResultsService.findall();
    }
}