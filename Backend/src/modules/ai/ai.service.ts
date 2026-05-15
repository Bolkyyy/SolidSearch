import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { Repository } from 'typeorm';
import { AiSettings } from './entity/ai-settings.entity';
import { AiAnswers } from './entity/ai-answer.entity';
import { UpdateAiSettingsDto } from './dto/update-aiSettings.dto';
import { HistoryService } from '../history/history.service';
import { DocumentService } from '../../models/documents/documents.service';
import { Documents } from '../../models/documents/documents.entity';


export interface AiProvider {
  code: string;
  name: string;
  base_url: string;
  models: string[];
}

const AI_PROVIDERS: AiProvider[] = [
  {
    code: 'deepseek',
    name: 'Deepseek',
    base_url: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-coder'],
  },
];

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiSettings)
    private readonly aiRepository: Repository<AiSettings>,

    @InjectRepository(AiAnswers)
    private readonly aiAnswerRepository: Repository<AiAnswers>,

    private readonly documentService: DocumentService,

    private readonly historyService: HistoryService,
  ) {}

  // Настройки AI

  async getAiSettings(): Promise<AiSettings[]> {
    return await this.aiRepository.find();
  }

  async saveAiSettings(dto: UpdateAiSettingsDto) {
    return await this.aiRepository.update(1, dto);
  }

  // Провайдеры AI

  async getAiProviders(): Promise<AiProvider[]> {
    return AI_PROVIDERS;
  }

  // Получение ответа по id

  async getAnswer(id: number) {
    return await this.aiAnswerRepository.find({ where: { answer_id: +id } });
  }

  // Нормализация запроса

  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  // Кэш

  private async findCachedAnswer(
    normalizedQuery: string,
  ): Promise<AiAnswers | null> {
    const existing = await this.historyService.findByQueryText(normalizedQuery);
    if (!existing) return null;

    return await this.aiAnswerRepository.findOne({
      where: { query_id: existing.id },
      order: { created_at: 'DESC' },
    });
  }

  // Форматирование документов для промпта

  private buildDocumentContext(documents: Documents[]): string {
    if (documents.length === 0) {
      return 'Документы по данному запросу не найдены в архиве.';
    }

    return documents
      .map(
        (doc, i) =>
          `[Документ ${i + 1}]
            ID: ${doc.id}
            Название: ${doc.title}
            Тип: ${doc.document_type}
            Автор: ${doc.author_name}
            Дата: ${doc.document_date}
            Номер архива: ${doc.archive_number}
            Статус: ${doc.status}`,
      )
      .join('\n\n');
  }

  // Основной метод

  async generateAnswer(
    query: string,
    userId?: number,
  ): Promise<{ answer: string; fromCache: boolean }> {
    const normalized = this.normalizeQuery(query);

    // 1. Проверка кэша
    const cached = await this.findCachedAnswer(normalized);
    if (cached) {
      console.log(`[AI] Кэш найден: "${query}"`);
      return { answer: cached.answer_text, fromCache: true };
    }

    // 2. Сохранение запроса в search_queries
    const savedQuery = await this.historyService.create({
      user_id: userId,
      query_text: normalized,
      query_type: 'ai',
    });

    // 3. Поиск документов в БД
    const documents = await this.documentService.searchDocuments(query);
    const documentContext = this.buildDocumentContext(documents);

    console.log(`[AI] Найдено документов: ${documents.length}`);

    // 4. Подбор настроек нейронки из БД
    const settings = await this.aiRepository.findOne({ where: { id: 1 } });

    const apiKey = settings?.api_key || process.env.AI_API_KEY || '';
    const model = settings?.model_name || 'deepseek-chat';
    const baseURL = settings?.base_url || 'https://api.deepseek.com/v1';

    const client = new OpenAI({ apiKey, baseURL });

    // 5. Запрос к нейронке с контекстом документов
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `Ты — умный помощник интеллектуального архива документов.
                       - Опирайся ТОЛЬКО на документы из архива ниже
                       - Давай чёткий, связный и короткий ответ
                       - Укажи название и ID документов подтверждающих ответ
                       - Если документов нет — скажи "Таких документов нет"
                       - Отвечай на том же языке что и запрос`,
        },
        {
          role: 'user',
          content: `Запрос: "${query}"\n\nДокументы:\n${documentContext}`,
        },
      ],
    });

    const answerText = response.choices[0].message.content || '';

    // 6. Сохранение ответ
    await this.aiAnswerRepository.save({
      query_id: savedQuery.id,
      answer_text: answerText,
      provider_code: settings?.provider_code || 'deepseek',
      model_name: model,
      confidence_score: 0.9,
      citation_document_id: documents[0]?.id || null,
      citation_fragment: documents[0]?.title || '',
    });

    return { answer: answerText, fromCache: false };
  }
}