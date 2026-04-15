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
import { ConfigModule, ConfigService } from '@nestjs/config';

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
    SearchQueriesModule,
    DocumentCollectionModule,
    DocumentFilesModule,
    DocumentSourcesModule,
    IndexJobsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}