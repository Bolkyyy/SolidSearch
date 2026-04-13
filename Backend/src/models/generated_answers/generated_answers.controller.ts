import { Controller, Get } from '@nestjs/common';
import { GeneratedAnswerService } from './generated_answers.service';

@Controller('generated-answers')
export class GeneratedAnswersController {
    constructor(private readonly generatedAnswerService: GeneratedAnswerService) {}

    @Get()
    async findall() {
        return await this.generatedAnswerService.findall();
    }
}