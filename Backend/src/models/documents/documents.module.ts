import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentService } from './documents.service';
import { Documents } from './documents.entity';
import { DocumentFiles } from './document_files.entity';
import { AiSettings } from '../../modules/ai/entity/ai-settings.entity';
import { IndexJobs } from '../index_jobs/index_jobs.entity';
import { NotificationsModule } from '../../modules/notifications/notifications.module';

@Module({
    imports: [TypeOrmModule.forFeature([Documents, DocumentFiles, AiSettings, IndexJobs]), NotificationsModule],
    controllers: [DocumentsController],
    providers: [DocumentService],
    exports: [DocumentService],
})
export class DocumentsModule {}