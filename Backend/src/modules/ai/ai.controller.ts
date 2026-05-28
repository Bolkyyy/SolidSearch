import { Controller, Post, Body, Get, Put, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { AiService } from './ai.service';
import { UpdateAiSettingsDto } from './dto/update-aiSettings.dto';

@Controller('search')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post()
  async search(@Body() body: { query: string; userId?: number }) {
    return await this.aiService.generateAnswer(body.query, body.userId);
  }

  @Post('stream')
  async stream(@Body() body: { query: string; userId?: number }, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    await this.aiService.streamAnswer(body.query, body.userId, res);
  }

  @Get(':id/answer')
  async getAnswer(@Param('id') id: number) {
    return this.aiService.getAnswer(id);
  }
}

@Controller('settings')
export class AiSettingsController {
  constructor(private readonly aiService: AiService) {}

  @Get('ai')
  async getAiSettings() {
    return await this.aiService.getAiSettings();
  }

  @Post('ai')
  async createAiSettings(@Body() dto: UpdateAiSettingsDto) {
    return this.aiService.createAiSettings(dto);
  }

  @Put('ai')
  async saveAiSettings(@Body() UpdateAiSettingsDto: UpdateAiSettingsDto) {
    return this.aiService.saveAiSettings(UpdateAiSettingsDto);
  }

  @Get('ai/providers')
  async getAiProviders() {
    return await this.aiService.getAiProviders();
  }
}
