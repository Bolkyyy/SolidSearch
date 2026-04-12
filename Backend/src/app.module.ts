import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './models/roles/roles.module';
import { DocumentsModule } from './models/documents/documents.module';
import { UsersController } from './models/users/users.controller';
import { UsersModule } from './models/users/users.module';
import { SearchQueriesModule } from './models/search_queries/search_queries.module';
import { DocumentCollectionModule } from './models/document_collection/document_collection.module';
import { DocumentFilesModule } from './models/document_files/document_files.module';
import { DocumentSourcesController } from './models/document_sources/document_sources.controller';
import { DocumentSourcesModule } from './models/document_sources/document_sources.module';
import { IndexJobsService } from './models/index_jobs/index_jobs.service';
import { IndexJobsController } from './models/index_jobs/index_jobs.controller';
import { IndexJobsModule } from './models/index_jobs/index_jobs.module';
import { AnswerCitationsModule } from './answer_citations/answer_citations.module';
import { GeneratedAnswersController } from './generated_answers/generated_answers.controller';
import { GeneratedAnswersService } from './generated_answers/generated_answers.service';
import { GeneratedAnswersModule } from './generated_answers/generated_answers.module';
import { AuditLogsModule } from './audit_logs/audit_logs.module';
import { EntitiesController } from './entities/entities.controller';
import { EntitiesService } from './entities/entities.service';
import { EntitiesModule } from './entities/entities.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://postgres.iufzexibjyajleprlpip:ks54bestgrup@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
      autoLoadEntities: true,
      synchronize: false,
      ssl: true,
      logging: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    RolesModule,
    DocumentsModule,
    UsersModule,
    SearchQueriesModule,
    DocumentCollectionModule,
    DocumentFilesModule,
    DocumentSourcesModule,
    IndexJobsModule,
    AnswerCitationsModule,
    GeneratedAnswersModule,
    AuditLogsModule,
    EntitiesModule
  ],
  controllers: [AppController, UsersController, DocumentSourcesController, IndexJobsController, GeneratedAnswersController, EntitiesController],
  providers: [AppService, GeneratedAnswersService, EntitiesService],
})
export class AppModule {}