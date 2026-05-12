import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController, AiSettingsController } from './ai.controller';
import { SupabaseModule } from '../../database/supabase/supabase/supabase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiSettings } from './entity/ai-settings.entity';
import { AiAnswers } from './entity/ai-answer.entity';

@Module({
  imports: [SupabaseModule, TypeOrmModule.forFeature([AiSettings, AiAnswers])],
  controllers: [AiController, AiSettingsController],
  providers: [AiService],
})
export class AiModule {}
