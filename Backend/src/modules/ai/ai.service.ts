import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { Repository } from 'typeorm';
import { AiSettings } from './entity/ai-settings.entity';
import { UpdateAiSettingsDto } from './dto/update-aiSettings.dto';
import { AiAnswers } from './entity/ai-answer.entity';

@Injectable()
export class AiService {
  // Подключение сущности
  constructor(
    @InjectRepository(AiSettings)
    private readonly aiRepository: Repository<AiSettings>,
    @InjectRepository(AiAnswers)
    private readonly aiAnswerRepository: Repository<AiAnswers>,
  ) {}
  
  // Получение текущих настроек AI  -------------------- 1 ✔
  async getAiSettings(): Promise<AiSettings[]> {
    return await this.aiRepository.find();
  }

  // Сохранение настроек AI ---------------------------- 2 ✔
  async saveAiSettings(UpdateAiSettingsDto: UpdateAiSettingsDto) {
    return await this.aiRepository.update(1, UpdateAiSettingsDto)
  }

  // Получение провайдеров AI -------------------------- 3
  async getAiProviders() {
    return 1;
  }

  // получение ответа ИИ по айди ----------------------- 4 ✔
  async getAnswer(id: number) {
    return await this.aiAnswerRepository.find({where: { answer_id: +id}});
  }

  
  // Искусственный интеллект
  private groq = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  async generateAnswer(query: string): Promise<string> {
    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Ты — умный помощник интеллектуального архива документов.

      Твоя задача:
      - Давать чёткий, связный и короткий ответ на запрос пользователя например "По вашему запросу найден Договор 451/2019 на ремонт железнодорожных путей, 
          заключенный 15 марта 2019 года с ООО "СтройПуть". Договор предусматривает выполнение работ по капитальному ремонту путей участка км 15-25 протяженностью 10 км."
      - НЕ пересказывай документы дословно — анализируй и делай выводы
      - Отвечай естественно, как эксперт а не как робот
      - Укажи какие документы подтверждают твой ответ
      - Если документов недостаточно — честно скажи об этом, например "Таких документов нет"
      - Отвечай на том же языке что и запрос`,
        },
        {
          role: 'user',
          content: `Запрос пользователя: "${query}"`,
        },
      ],
    });

    return response.choices[0].message.content || '';
  }
}