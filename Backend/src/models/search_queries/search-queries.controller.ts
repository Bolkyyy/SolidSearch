import { Controller, Post, Body } from '@nestjs/common';
import { SearchQueriesService } from './search-queries.service';
import { CreateSearchQueryDto } from './dto/create-search-query.dto';

@Controller('search-queries')
export class SearchQueriesController {
  constructor(private readonly service: SearchQueriesService) {}

  @Post()
  async create(@Body() dto: CreateSearchQueryDto) {
    return this.service.create(dto);
  }
}