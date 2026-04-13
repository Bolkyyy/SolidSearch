import { Module } from '@nestjs/common';
import { AnswerCitationsService } from './answer_citations.service';
import { AnswerCitationsController } from './answer_citations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerCitations } from './answer_citations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnswerCitations])],
  providers: [AnswerCitationsService],
  controllers: [AnswerCitationsController],
  exports: [AnswerCitationsService]
})
export class AnswerCitationsModule {}
