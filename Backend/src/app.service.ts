import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    try {
      await this.dataSource.query(`
        ALTER TABLE solidsearchdb.search_queries
        ADD COLUMN IF NOT EXISTS response_time_ms float;
      `);
      this.logger.log('Migration OK: search_queries.response_time_ms');
    } catch (e: any) {
      this.logger.error('Migration failed: search_queries.response_time_ms', e.message);
    }

    try {
      await this.dataSource.query(`
        ALTER TABLE solidsearchdb.documents
        ADD COLUMN IF NOT EXISTS user_id integer;
      `);
      this.logger.log('Migration OK: documents.user_id');
    } catch (e: any) {
      this.logger.error('Migration failed: documents.user_id', e.message);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
