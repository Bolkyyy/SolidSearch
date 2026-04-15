import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedAnswerService } from './generated_answers.service';
import { GeneratedAnswersController } from './generated_answers.controller';
import { GeneratedAnswer } from './generated_answers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GeneratedAnswer])],
  providers: [GeneratedAnswerService],
  controllers: [GeneratedAnswersController],
  exports: [GeneratedAnswerService]
})
export class GeneratedAnswersModule {}