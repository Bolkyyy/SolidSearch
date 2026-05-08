import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai-search')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post()
  async search(@Body() body: { query: string; }) {
    const answer = await this.aiService.generateAnswer(body.query);
    return { answer };
  }
}