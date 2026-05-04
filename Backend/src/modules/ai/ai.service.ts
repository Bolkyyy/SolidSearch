import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
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