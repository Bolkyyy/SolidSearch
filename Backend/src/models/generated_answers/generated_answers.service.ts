import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneratedAnswer } from './generated_answers.entity';

@Injectable()
export class GeneratedAnswerService {
    constructor(
        @InjectRepository(GeneratedAnswer)
        private readonly generatedAnswerRepository: Repository<GeneratedAnswer>,
    ) {}

    async findall(): Promise<GeneratedAnswer[]> {
        return await this.generatedAnswerRepository.find();
    }
}