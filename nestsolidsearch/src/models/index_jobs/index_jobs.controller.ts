import { Controller, Get } from '@nestjs/common';
import { IndexJobsService } from './index_jobs.service';

@Controller('index_jobs')
export class IndexJobsController {
    constructor(private readonly indexJobsService: IndexJobsService) {}

    @Get()
    async findall() {
        return await this.indexJobsService.findall();
    }
}
