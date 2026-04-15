import { Controller, Get } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';

@Controller('embeddings')
export class EmbeddingsController {
    constructor(private readonly embeddingsService: EmbeddingsService) {}

    @Get()
    async findall() {
        return await this.embeddingsService.findall();
    }
}