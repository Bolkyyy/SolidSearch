import { Module } from '@nestjs/common';
import { IndexJobsController } from './index_jobs.controller';
import { IndexJobsService } from './index_jobs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndexJobs } from './index_jobs.entity';

@Module({
    imports: [TypeOrmModule.forFeature([IndexJobs])],
    providers: [IndexJobsService],
    controllers: [IndexJobsController],
    exports: [IndexJobsService]
})
export class IndexJobsModule {}
