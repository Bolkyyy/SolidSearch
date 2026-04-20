import { Module } from '@nestjs/common';
import { AnswerCitationsService } from './answer_citations.service';

@Module({
  providers: [AnswerCitationsService]
})
export class AnswerCitationsModule {}
