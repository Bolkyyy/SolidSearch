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
import { encrypt, decrypt } from './Encryption/crypto';

export interface AiProvider {
  code: string;
  name: string;
  base_url: string;
  models: string[];
}

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

  // Настройки AI ------------------------ 1 

  async getAiSettings(): Promise<AiSettings[]> {
    return await this.aiRepository.find();
  }

  async saveAiSettings(dto: UpdateAiSettingsDto) {
    if (dto.api_key) {
      dto.api_key = encrypt(dto.api_key);
    }
    return await this.aiRepository.update(1, dto);
  }

  // Провайдеры AI ------------------------ 2

  async getAiProviders() {
    return await this.aiRepository.find({
      select: ['provider_code', 'model_name'],
    });
  }

  // Получение ответа по id ------------------------ 3 

  async getAnswer(id: number) {
    return await this.aiAnswerRepository.find({ where: { answer_id: +id } });
  }

  // Нормализация запроса 

  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  // Кэш

  private async findCachedAnswer(normalizedQuery: string): Promise<AiAnswers | null> {
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

  // Дешифровка API-ключа из БД

  private decryptApiKey(encryptedKey: string): string {
    try {
      return decrypt(encryptedKey);
    } catch (e) {
      console.error('[AI] Ошибка дешифровки API-ключа:', e);
      return encryptedKey;
    }
  }

  // Основной пайплайн 

  async generateAnswer(
    query: string,
    userId?: number,
  ): Promise<{ answer: string; fromCache: boolean; documentIds: number[] }> {

    // 1. Нормализация и проверка кэша
    const normalized = this.normalizeQuery(query);
    const cached = await this.findCachedAnswer(normalized);
    if (cached) {
      console.log(`[AI] Кэш найден: "${query}"`);
      return {
        answer: cached.answer_text,
        fromCache: true,
        documentIds: cached.citation_document_id ? [cached.citation_document_id] : [],
      };
    }

    // 2. Сохранение запроса в search_queries
    const savedQuery = await this.historyService.create({
      user_id: userId,
      query_text: normalized,
      query_type: 'ai',
    });

    // 3. Поиск документов в БД
    const documents = await this.documentService.searchDocuments(query);
    
    // 4. Формирование контекста для AI
    const documentContext = this.buildDocumentContext(documents);
      console.log(`[AI] Запрос: "${query}"`);
      console.log(`[AI] Найдено документов: ${documents.length}`);
      console.log(`[AI] Контекст:\n${documentContext}`);  
    // 5. Загрузка настроек и дешифровка ключа
    const settings = await this.aiRepository.findOne({ where: { id: 1 } });
    const rawKey = settings?.api_key || process.env.AI_API_KEY || '';
    const apiKey = settings?.api_key ? this.decryptApiKey(rawKey) : rawKey;
    const model = settings?.model_name || 'deepseek-chat';
    const baseURL = settings?.base_url || 'https://api.deepseek.com/v1';

    const client = new OpenAI({ apiKey, baseURL });

    // 6. Запрос к AI с контекстом документов
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `Ты — умный помощник интеллектуального архива документов.
                  - Опирайся ТОЛЬКО на документы из архива ниже
                  - Давай чёткий, связный и короткий ответ
                  - Укажи название и ID ВСЕХ документов подтверждающих ответ
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
    const documentIds = documents.map(d => d.id);

    // 7. Сохранение ответа с метаданными цитирования
    await this.aiAnswerRepository.save({
      query_id: savedQuery.id,
      answer_text: answerText,
      provider_code: settings?.provider_code || 'deepseek',
      model_name: model,
      confidence_score: 0.9,
      citation_document_id: documents[0]?.id ?? null,
      citation_fragment: documents[0]?.title ?? '',
    });

    return { answer: answerText, fromCache: false, documentIds };
  }
}