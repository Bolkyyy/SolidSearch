import { Controller, Get } from '@nestjs/common';
import { SearchQueriesService } from './search_queries.service';


@Controller('search-queries')
export class SearchQueriesController {
    constructor(private readonly searchQueriesService: SearchQueriesService) {}
    
    @Get()
    async findall() {
        return await this.searchQueriesService.findall();
    }
}
