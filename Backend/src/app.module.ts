import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsModule } from './models/documents/documents.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AiModule } from './modules/ai/ai.module';
import { HistoryModule } from './modules/history/history.module';
import { SearchQueriesModule } from './models/search_queries/search-queries.module';
import { UsersModule } from './models/users/users.module';

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
        retryAttempts: 10,
        retryDelay: 3000,
        extra: {
          keepAlive: true,
          keepalives: 1,
          keepalives_idle: 10,
          keepalives_interval: 5,
          keepalives_count: 3,
          max: 5,
          min: 0,
          idleTimeoutMillis: 5000,
          connectionTimeoutMillis: 15000,
          allowExitOnIdle: true,
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    DashboardModule,
    HistoryModule,
    DocumentsModule,
    AiModule,
    SearchQueriesModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}