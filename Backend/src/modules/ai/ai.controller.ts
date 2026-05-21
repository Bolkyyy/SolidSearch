import { Controller, Post, Body, Get, Put, Param } from '@nestjs/common';
import { AiService } from './ai.service';
import { UpdateAiSettingsDto } from './dto/update-aiSettings.dto';

@Controller('search')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // Отправление запроса ИИ 
  @Post()
  async search(@Body() body: { query: string; }) {
    const answer = await this.aiService.generateAnswer(body.query);
    return { answer };
  }

  // получение ответа ИИ по айди ----------------------- 4 ✔
  @Get(':id/answer') 
  async getAnswer(@Param("id") id: number){
    return this.aiService.getAnswer(id);
  }
}

@Controller('settings')
export class AiSettingsController {
  constructor(private readonly aiService: AiService) {}

  // Получение текущих настроек AI  -------------------- 1 ✔
  @Get('ai')
  async getAiSettings() {
    return await this.aiService.getAiSettings();
  }

  // Сохранение настроек AI ---------------------------- 2 ✔
  @Put('ai')
  async saveAiSettings(@Body() UpdateAiSettingsDto: UpdateAiSettingsDto) {
    return this.aiService.saveAiSettings(UpdateAiSettingsDto);
  }

  @Get('ai/providers') 
  async getAiProviders() {
    return await this.aiService.getAiProviders()
  }

}