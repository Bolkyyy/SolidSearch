import { Test, TestingModule } from '@nestjs/testing';
import { IndexJobsService } from './index_jobs.service';

describe('IndexJobsService', () => {
  let service: IndexJobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndexJobsService],
    }).compile();

    service = module.get<IndexJobsService>(IndexJobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
