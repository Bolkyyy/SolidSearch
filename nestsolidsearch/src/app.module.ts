import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './models/roles/roles.module';
import { DocumentsModule } from './models/documents/documents.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}