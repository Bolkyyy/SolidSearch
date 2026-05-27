import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { AiSettings } from './entity/ai-settings.entity';
import { AiAnswers } from './entity/ai-answer.entity';
import { UpdateAiSettingsDto } from './dto/update-aiSettings.dto';
import { HistoryService } from '../history/history.service';
import { DocumentService } from '../../models/documents/documents.service';
import { Documents } from '../../models/documents/documents.entity';
import { encrypt, decrypt } from './Encryption/crypto';

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

  async getAiSettings(): Promise<AiSettings[]> {
    return await this.aiRepository.find();
  }

  async saveAiSettings(dto: UpdateAiSettingsDto) {
    if (dto.api_key) {
      dto.api_key = encrypt(dto.api_key);
    }
    return await this.aiRepository.update(1, dto);
  }

  async getAiProviders() {
    return await this.aiRepository.find({
      select: ['provider_code', 'model_name'],
    });
  }

  async getAnswer(id: number) {
    return await this.aiAnswerRepository.find({ where: { answer_id: +id } });
  }

  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  private buildDocumentContext(documents: Documents[]): string {
    return documents
      .map((doc, i) => {
        const summary = doc.files?.[0]?.normalized_text?.slice(0, 800) || '';
        const text = doc.files?.[0]?.extracted_text?.slice(0, 600) || '';
        const content = summary || text || '(содержимое недоступно)';
        return `[Документ ${i + 1}] ID: ${doc.id}\nНазвание: ${doc.title}\nТип: ${doc.document_type || '—'} | Автор: ${doc.author_name || '—'} | Дата: ${doc.document_date || '—'}\nСодержание: ${content}`;
      })
      .join('\n\n---\n\n');
  }

  private async getClient(): Promise<{ client: OpenAI; model: string; provider: string }> {
    const settings = await this.aiRepository.findOne({ where: { id: 1 } });
    const rawKey = settings?.api_key || process.env.AI_API_KEY || '';
    let apiKey = rawKey;
    try { apiKey = decrypt(rawKey); } catch {}
    const model = settings?.model_name || 'deepseek-chat';
    const baseURL = settings?.base_url || 'https://api.deepseek.com/v1';
    const provider = settings?.provider_code || 'deepseek';
    return { client: new OpenAI({ apiKey, baseURL, timeout: 30_000 }), model, provider };
  }

  private async extractKeywords(client: OpenAI, model: string, query: string): Promise<string> {
    try {
      const response = await client.chat.completions.create({
        model,
        max_tokens: 100,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `Извлеки ключевые слова из поискового запроса пользователя для поиска в архиве документов.
                      Правила:
                      1. Исправь ВСЕ опечатки и ошибки
                      2. Убери мусорные слова: найди, найти, покажи, документ, документы, файл, файлы, про, для, все, мне, нужно, хочу, где, как, что, это, такое
                      3. Оставь ТОЛЬКО значимые слова (названия, термины, имена, даты)
                      4. Добавь синонимы и близкие по смыслу слова для каждого ключевого термина
                      5. Отвечай ТОЛЬКО словами через пробел, без кавычек и пояснений

                      Примеры:
                      "Найди документы про интеллекутальный ахрив" → интеллектуальный архив
                      "покажи все файлы genki workbok" → genki workbook
                      "дагавор на ремонт путй за 2019" → договор ремонт пути 2019
                      "квиз про казаков" → квиз викторина тест казаки казачьи
                      "лазеры в криминалистике" → лазеры криминалистика криминалистике
                      "распределение задач команда" → распределение задачи команда участники`,
          },
          { role: 'user', content: query },
        ],
      });
      return response.choices[0].message.content?.trim() || query;
    } catch {
      return query;
    }
  }

  async streamAnswer(query: string, userId: number | undefined, res: Response): Promise<void> {
    const send = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      if (typeof (res as any).flush === 'function') (res as any).flush();
    };

    try {
      const { client, model, provider } = await this.getClient();

      send({ type: 'searching' });

      console.log('[SEARCH] Query:', query);
      const corrected = await this.extractKeywords(client, model, query);
      console.log('[SEARCH] Corrected keywords:', corrected);

      let documents = await this.documentService.searchDocuments(corrected);

      if (documents.length === 0 && corrected.toLowerCase() !== query.toLowerCase()) {
        console.log('[SEARCH] No results with corrected, trying original query');
        documents = await this.documentService.searchDocuments(query);
      }

      console.log('[SEARCH] Found', documents.length, 'documents');
      send({ type: 'documents', documents });

      let savedQuery: any = null;
      try {
        savedQuery = await this.historyService.create({
          user_id: userId,
          query_text: query,
          query_type: 'ai',
          status: documents.length > 0 ? 'success' : 'not_found',
          result_count: documents.length,
        });
      } catch (dbErr) {
        console.error('[HISTORY SAVE ERROR]', dbErr);
      }

      if (documents.length === 0) {
        send({ type: 'done' });
        res.end();
        return;
      }

      const context = this.buildDocumentContext(documents);
      const stream = await client.chat.completions.create({
        model,
        stream: true,
        max_tokens: 1200,
        messages: [
          {
            role: 'system',
            content: `Ты — помощник интеллектуального архива. Опирайся ТОЛЬКО на документы ниже. Дай чёткий, структурированный ответ. Отвечай на языке запроса.`,
          },
          {
            role: 'user',
            content: `Запрос: "${query}"\n\nДокументы:\n${context}`,
          },
        ],
      });

      let fullAnswer = '';
      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token) {
          fullAnswer += token;
          send({ type: 'token', token });
        }
      }

      if (fullAnswer && savedQuery?.id) {
        try {
          await this.aiAnswerRepository.save({
            query_id: savedQuery.id,
            answer_text: fullAnswer,
            provider_code: provider,
            model_name: model,
            confidence_score: 1.0,
          });
        } catch (dbErr) {
          console.error('[ANSWER SAVE ERROR]', dbErr);
        }
      }

      send({ type: 'done' });
    } catch (e: any) {
      console.error('[STREAM ERROR]', e.message, e.status || '', e.code || '');
      send({ type: 'error', message: e.message });
    }

    res.end();
  }

  async generateAnswer(
    query: string,
    userId?: number,
  ): Promise<{ answer: string; fromCache: boolean; documentIds: number[]; documents: Documents[] }> {
    const normalized = this.normalizeQuery(query);
    const documents = await this.documentService.searchDocuments(query);

    await this.historyService.create({
      user_id: userId,
      query_text: normalized,
      query_type: 'ai',
      status: documents.length > 0 ? 'success' : 'not_found',
      result_count: documents.length,
    });

    return {
      answer: '',
      fromCache: false,
      documentIds: documents.map((d) => d.id),
      documents,
    };
  }
}
