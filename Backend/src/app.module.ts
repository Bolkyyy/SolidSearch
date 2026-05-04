import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './models/roles/roles.module';
import { DocumentsModule } from './models/documents/documents.module';
import { UsersModule } from './models/users/users.module';
import { DocumentCollectionModule } from './models/document_collection/document_collection.module';
import { DocumentFilesModule } from './models/document_files/document_files.module';
import { DocumentSourcesModule } from './models/document_sources/document_sources.module';
import { IndexJobsModule } from './models/index_jobs/index_jobs.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AnswerCitationsModule } from './models/answer_citations/answer_citations.module';
import { DocumentMetadataModule } from './models/document_metadata/document_metadata.module';
import { SearchResultsModule } from './models/search_results/search_results.module';
import { AiModule } from './modules/ai/ai.module';
import { HistoryModule } from './modules/history/history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
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
      inject: [ConfigService],
    }),
    RolesModule,
    DocumentsModule,
    UsersModule,
    DocumentCollectionModule,
    DocumentFilesModule,
    DocumentSourcesModule,
    IndexJobsModule,
    AuthModule,
    DashboardModule,
    AnswerCitationsModule,
    DocumentMetadataModule,
    SearchResultsModule,
    HistoryModule,
    AiModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}