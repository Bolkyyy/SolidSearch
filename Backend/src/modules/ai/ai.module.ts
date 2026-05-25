import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController, AiSettingsController } from './ai.controller';
import { SupabaseModule } from '../../database/supabase/supabase/supabase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiSettings } from './entity/ai-settings.entity';
import { AiAnswers } from './entity/ai-answer.entity';
import { HistoryModule } from '../history/history.module';
import { DocumentsModule } from '../../models/documents/documents.module';

@Module({
  imports: [SupabaseModule, TypeOrmModule.forFeature([AiSettings, AiAnswers]), HistoryModule, DocumentsModule],
  controllers: [AiController, AiSettingsController],
  providers: [AiService],
})
export class AiModule {}
