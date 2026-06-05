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

  async createAiSettings(dto: UpdateAiSettingsDto) {
    if (dto.api_key) {
      dto.api_key = encrypt(dto.api_key);
    }
    return await this.aiRepository.save(dto);
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

  /**/

  async getAnswer(id: number) {
    return await this.aiAnswerRepository.find({ where: { answer_id: +id } });
  }

  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  private async withRetry<T>(
    label: string,
    fn: () => Promise<T>,
    attempts = 4,
  ): Promise<T> {
    for (let i = 1; i <= attempts; i++) {
      try {
        return await fn();
      } catch (err: any) {
        const isConn =
          err?.message?.includes('Connection terminated') ||
          err?.message?.includes('connection') ||
          err?.code === 'ECONNRESET' ||
          err?.code === 'ECONNREFUSED';
        if (!isConn || i === attempts) throw err;
        const delay = 600 * i;
        console.warn(
          `[AI RETRY] ${label}: попытка ${i}/${attempts}, повтор через ${delay}мс`,
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw new Error(`[AI RETRY] ${label}: все попытки исчерпаны`);
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

  private async getClient(): Promise<{
    client: OpenAI;
    model: string;
    provider: string;
  }> {
    const settings = await this.aiRepository.findOne({ where: { id: 1 } });
    const rawKey = settings?.api_key || process.env.AI_API_KEY || '';
    let apiKey = rawKey;
    try {
      apiKey = decrypt(rawKey);
    } catch {}
    const model = settings?.model_name || 'deepseek-chat';
    const baseURL = settings?.base_url || 'https://api.deepseek.com/v1';
    const provider = settings?.provider_code || 'deepseek';
    return {
      client: new OpenAI({ apiKey, baseURL, timeout: 30_000 }),
      model,
      provider,
    };
  }

  private async aiSelectDocuments(
    client: OpenAI,
    model: string,
    query: string,
    allDocs: Documents[],
  ): Promise<Documents[]> {
    const docList = allDocs
      .map((d) => {
        const summary = d.files?.[0]?.normalized_text?.slice(0, 400) || '';
        const text = d.files?.[0]?.extracted_text?.slice(0, 300) || '';
        const content = summary || text || '(содержимое недоступно)';
        return `ID:${d.id} | ${d.title} | ${content.slice(0, 200)}`;
      })
      .join('\n');

    const response = await client.chat.completions.create({
      model,
      max_tokens: 200,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `Ты ищешь документы в архиве по запросу пользователя.
                    Запрос: "${query}"
                    Список документов:
                    ${docList}

                    Инструкция:
                    - Выбери ВСЕ документы которые хоть как-то связаны с запросом
                    - Обязательно учитывай СИНОНИМЫ: квиз=викторина=тест, договор=контракт, задачи=задания=план
                    - Если запрос на одном языке а документ на другом — это тоже совпадение
                    - Лучше выбрать лишний документ чем пропустить нужный
                    - Ответь ТОЛЬКО числами ID через запятую
                    - Пиши "none" только если запрос совсем не связан ни с одним документом (например запрос про погоду а документы про ремонт)
                    Твой ответ (только ID):`,
        },
      ],
    });

    const raw = response.choices[0].message.content?.trim() || 'none';
    console.log('[AI-SELECT] Response:', raw.slice(0, 100));

    if (raw.toLowerCase() === 'none') return [];
    const validIds = new Set(allDocs.map((d) => d.id));
    const matches = raw.match(/\d+/g);
    if (!matches) return [];
    const ids = matches.map(Number).filter((id) => validIds.has(id));
    return this.documentService.findByIds(ids);
  }

  async streamAnswer(
    query: string,
    userId: number | undefined,
    res: Response,
    filters?: { period?: string; source?: string; format?: string },
  ): Promise<void> {
    const send = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      if (typeof (res as any).flush === 'function') (res as any).flush();
    };

    try {
      const { client, model, provider } = await this.getClient();

      send({ type: 'searching' });
      console.log('[SEARCH] Query:', query, 'Filters:', filters);

      let documents = await this.withRetry('searchDocuments', () =>
        this.documentService.searchDocuments(query, filters),
      );

      console.log('[SEARCH] DB found', documents.length, 'documents');

      if (documents.length <= 1) {
        console.log('[SEARCH] Few results, running AI selection to find more');
        const allDocs = await this.withRetry('findall', () =>
          this.documentService.findall(),
        );
        const filteredAllDocs = this.documentService.applyFiltersToList(allDocs, filters);
        if (filteredAllDocs.length > 0) {
          const aiDocs = await this.aiSelectDocuments(
            client,
            model,
            query,
            filteredAllDocs,
          );
          const existingIds = new Set(documents.map((d) => d.id));
          for (const doc of aiDocs) {
            if (!existingIds.has(doc.id)) documents.push(doc);
          }
        }
      }

      // Финальный пост-фильтр — гарантирует что фильтры соблюдены после всех этапов поиска
      documents = this.documentService.applyFiltersToList(documents, filters);

      console.log('[SEARCH] Found', documents.length, 'documents');
      send({ type: 'documents', documents });

      let savedQuery: any = null;
      try {
        savedQuery = await this.withRetry('create history', () =>
          this.historyService.create({
            user_id: userId,
            query_text: query,
            query_type: 'ai',
            status: documents.length > 0 ? 'success' : 'not_found',
            result_count: documents.length,
            filters_json: filters,
          }),
        );
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
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `Ты — помощник интеллектуального архива документов. Опирайся ТОЛЬКО на документы из архива ниже. Дай короткий связный ответ из 2-3 предложений — что найдено и какова суть. Отвечай на языке запроса.`,
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
          await this.withRetry('save answer', () =>
            this.aiAnswerRepository.save({
              query_id: savedQuery.id,
              answer_text: fullAnswer,
              provider_code: provider,
              model_name: model,
              confidence_score: 1.0,
              document_ids: documents.map((d) => d.id),
            }),
          );
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

  async getCachedResult(
    query: string,
    userId: number,
    filters?: any,
  ): Promise<{ answer: string; documents: Documents[] } | null> {
    const historyEntry = await this.historyService.findByQueryAndUser(
      query,
      userId,
      filters,
    );
    if (!historyEntry) return null;

    const cached = await this.aiAnswerRepository.findOne({
      where: { query_id: historyEntry.id },
      order: { created_at: 'DESC' },
    });

    if (!cached?.answer_text || !cached?.document_ids?.length) return null;

    const documents = await this.withRetry('findByIds cache', () =>
      this.documentService.findByIds(cached.document_ids),
    );

    return { answer: cached.answer_text, documents };
  }

  async generateAnswer(
    query: string,
    userId?: number,
  ): Promise<{
    answer: string;
    fromCache: boolean;
    documentIds: number[];
    documents: Documents[];
  }> {
    const normalized = this.normalizeQuery(query);
    const documents = await this.withRetry('searchDocuments', () =>
      this.documentService.searchDocuments(query),
    );

    try {
      await this.withRetry('create history', () =>
        this.historyService.create({
          user_id: userId,
          query_text: normalized,
          query_type: 'ai',
          status: documents.length > 0 ? 'success' : 'not_found',
          result_count: documents.length,
        }),
      );
    } catch (dbErr) {
      console.warn('[HISTORY SAVE ERROR]', dbErr);
    }

    return {
      answer: '',
      fromCache: false,
      documentIds: documents.map((d) => d.id),
      documents,
    };
  }
}
