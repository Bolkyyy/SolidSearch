import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IndexJobs } from './index_jobs.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IndexJobsService {
    constructor (
        @InjectRepository(IndexJobs)
        private readonly indexJobsRepository: Repository<IndexJobs>,
    ) {}

    async findall(): Promise<IndexJobs[]> {
        return await this.indexJobsRepository.find();
    }
}
