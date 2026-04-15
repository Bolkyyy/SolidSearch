import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerCitations } from './answer_citations.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnswerCitationsService {
    constructor (
        @InjectRepository(AnswerCitations)
        private readonly answerCitiationsRepository: Repository<AnswerCitations>
    ) {}

    async findall(): Promise<AnswerCitations[]> {
        return await this.answerCitiationsRepository.find();
    }
}
