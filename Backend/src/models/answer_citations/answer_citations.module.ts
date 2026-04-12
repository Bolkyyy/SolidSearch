import { Module } from '@nestjs/common';
import { AnswerCitationsService } from './answer_citations.service';
import { AnswerCitationsController } from './answer_citations.controller';

@Module({
  providers: [AnswerCitationsService],
  controllers: [AnswerCitationsController]
})
export class AnswerCitationsModule {}
