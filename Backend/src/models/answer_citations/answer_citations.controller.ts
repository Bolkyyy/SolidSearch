import { Controller, Get } from '@nestjs/common';
import { AnswerCitationsService } from './answer_citations.service';

@Controller('answer-citations')
export class AnswerCitationsController {
    constructor(private readonly answerCitationService: AnswerCitationsService){}

    @Get()
    async findall() {
        return await this.answerCitationService.findall();
    }
}
