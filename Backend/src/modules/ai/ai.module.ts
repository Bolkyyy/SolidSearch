import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { SupabaseModule } from '../../database/supabase/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
