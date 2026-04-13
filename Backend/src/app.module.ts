import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './models/roles/roles.module';
import { DocumentsModule } from './models/documents/documents.module';
import { UsersModule } from './models/users/users.module';
import { SearchQueriesModule } from './models/search_queries/search_queries.module';
import { DocumentCollectionModule } from './models/document_collection/document_collection.module';
import { DocumentFilesModule } from './models/document_files/document_files.module';
import { DocumentSourcesModule } from './models/document_sources/document_sources.module';
import { IndexJobsModule } from './models/index_jobs/index_jobs.module';
import { AnswerCitationsModule } from './models/answer_citations/answer_citations.module';
import { GeneratedAnswersModule } from './models/generated_answers/generated_answers.module';
import { AuditLogsModule } from './models/audit_logs/audit_logs.module';
import { EntitiesModule } from './models/entities/entities.module';
import { DocumentChunksModule } from './models/document_chunks/document_chunks.module';
import { DocumentEntitiesModule } from './models/document_entities/document_entities.module';
import { DocumentMetadataModule } from './models/document_metadata/document_metadata.module';
import { DocumentPagesModule } from './models/document_pages/document_pages.module';
import { EmbeddingsModule } from './models/embeddings/embeddings.module';
import { SearchResultsModule } from './models/search_results/search_results.module';

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
    EntitiesModule,
    DocumentChunksModule,
    DocumentEntitiesModule,
    DocumentMetadataModule,
    DocumentPagesModule,
    EmbeddingsModule,
    EntitiesModule,
    GeneratedAnswersModule,
    SearchResultsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}