import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Layout from "../../components/Layout/Layout";
import type { SearchDocument } from "../../interfaces/SearchPageInterface";

const API_URL = "http://localhost:3001";
const CACHE_KEY = "solidSearch_cache";
const MAX_CACHE_ENTRIES = 20;

interface CachedResult {
  query: string;
  userId: number;
  documents: SearchDocument[];
  answer: string;
}

type CacheMap = Record<string, CachedResult>;

const buildCacheKey = (q: string, uid: number) =>
  `${uid}:${q.toLowerCase().trim()}`;

const readCache = (query: string, userId: number): CachedResult | null => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const map: CacheMap = JSON.parse(raw);
    return map[buildCacheKey(query, userId)] ?? null;
  } catch {}
  return null;
};

const saveCache = (data: CachedResult) => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    const map: CacheMap = raw ? JSON.parse(raw) : {};
    map[buildCacheKey(data.query, data.userId)] = data;
    const keys = Object.keys(map);
    if (keys.length > MAX_CACHE_ENTRIES) {
      keys
        .slice(0, keys.length - MAX_CACHE_ENTRIES)
        .forEach((k) => delete map[k]);
    }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {}
};

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getDocDescription = (doc: SearchDocument): string => {
  const summary = doc.files?.[0]?.normalized_text;
  if (summary && summary.length > 10)
    return summary.length > 220 ? summary.slice(0, 220) + "…" : summary;
  return `${doc.document_type || "Документ"} от ${formatDate(doc.document_date)}`;
};

const DocCard = ({
  doc,
  query,
  userId,
}: {
  doc: SearchDocument;
  query: string;
  userId: number;
}) => (
  <div className="doc-card">
    <div className="doc-card-header">
      <span className="doc-card-title">{doc.title}</span>
    </div>
    <div className="doc-card-meta">
      {doc.document_type || "Документ"}&nbsp;•&nbsp;
      {formatDate(doc.document_date)}&nbsp;
    </div>
    <p className="doc-card-desc">{getDocDescription(doc)}</p>
    <div className="doc-card-actions">
      <Link
        to={`/document/${doc.id}`}
        state={{ returnQuery: query, returnUserId: userId }}
        className="router-link"
      >
        <button className="btn-open">
          <i className="fa fa-external-link" aria-hidden="true"></i> Открыть
        </button>
      </Link>
    </div>
  </div>
);

const SourceItem = ({
  doc,
  isLast,
  query,
  userId,
}: {
  doc: SearchDocument;
  isLast: boolean;
  query: string;
  userId: number;
}) => (
  <div className={`source-item${isLast ? " source-item-last" : ""}`}>
    <div className="source-item-header">
      <span className="source-item-name">{doc.title}</span>
    </div>
    <div className="source-item-page">ID: {doc.id}</div>
    <p className="source-item-snippet">
      {doc.files?.[0]?.normalized_text?.slice(0, 130) ||
        "Краткое содержание недоступно"}
      …
    </p>
    <Link
      to={`/document/${doc.id}`}
      state={{ returnQuery: query, returnUserId: userId }}
      className="router-link"
    >
      <span className="source-item-link">
        <i className="fa fa-folder-open" aria-hidden="true"></i> Открыть
        документ
      </span>
    </Link>
  </div>
);

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state as { query: string; userId: number } | null;

  const query: string = navState?.query ?? "";
  const userId: number = navState?.userId ?? 0;

  const initialCache = query ? readCache(query, userId) : null;

  const [documents, setDocuments] = useState<SearchDocument[]>(
    initialCache?.documents ?? [],
  );
  const [answer, setAnswer] = useState<string>(initialCache?.answer ?? "");
  const [searching, setSearching] = useState(!initialCache);
  const [docsLoading, setDocsLoading] = useState(!initialCache);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query || initialCache) return;

    const controller = new AbortController();
    let liveDocs: SearchDocument[] = [];
    let liveAnswer = "";

    const stream = async () => {
      try {
        const response = await fetch(`${API_URL}/search/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, userId }),
          signal: controller.signal,
        });

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "searching") {
                setSearching(true);
              } else if (data.type === "documents") {
                setSearching(false);
                setDocsLoading(false);
                liveDocs = data.documents;
                setDocuments(data.documents);
                if (data.documents.length > 0) setAnswerLoading(true);
              } else if (data.type === "token") {
                liveAnswer += data.token;
                setAnswer((prev) => prev + data.token);
              } else if (data.type === "done") {
                setAnswerLoading(false);
                
                if (!liveAnswer && liveDocs.length > 0) {
                  const names = liveDocs.map((d) => d.title).join(", ");
                  liveAnswer = `По вашему запросу найдены документы: ${names}.`;
                  setAnswer(liveAnswer);
                }
                saveCache({
                  query,
                  userId,
                  documents: liveDocs,
                  answer: liveAnswer,
                });
              } else if (data.type === "error") {
                setError(data.message);
                setDocsLoading(false);
                setAnswerLoading(false);
              }
            } catch {}
          }
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError("Ошибка соединения с сервером");
        setDocsLoading(false);
      }
    };

    stream();
    return () => controller.abort();
  }, [query]);

  if (!query) {
    return (
      <Layout>
        <div className="no-data-block">
          <h2>Нет данных для отображения</h2>
          <button className="ai-search-btn" onClick={() => navigate("/search")}>
            <i className="fa fa-arrow-left back-icon" />
            На страницу поиска
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="search-results-wrapper">
        <div className="search-results-main">
          <div className="search-results-heading">
            <h2 className="search-results-title">{query}</h2>
            <span className="search-results-count">
              {docsLoading ? "Поиск…" : `Найдено: ${documents.length}`}
            </span>
          </div>

          {(searching || docsLoading) && (
            <div className="ai-answer-block">
              <div className="ai-answer-header">
                <span className="ai-answer-icon">
                  <i className="fas fa-robot"></i>
                </span>
                <span className="ai-answer-label">
                  {searching ? "Идет поиск документов…" : "Загрузка…"}
                </span>
              </div>
              <p className="ai-answer-text">
                <i className="fa fa-spinner fa-spin"></i>
              </p>
            </div>
          )}

          {!searching && answerLoading && answer === "" && (
            <div className="ai-answer-block">
              <div className="ai-answer-header">
                <span className="ai-answer-icon">
                  <i className="fas fa-robot"></i>
                </span>
                <span className="ai-answer-label">Формулируется ответ…</span>
              </div>
              <p className="ai-answer-text">
                <i className="fa fa-spinner fa-spin"></i>
              </p>
            </div>
          )}

          {answer && (
            <div className="ai-answer-block">
              <div className="ai-answer-header">
                <span className="ai-answer-icon">
                  <i className="fas fa-robot"></i>
                </span>
                <span className="ai-answer-label">Ответ системы</span>
              </div>
              <div className="ai-answer-text markdown-body">
                <ReactMarkdown>{answer}</ReactMarkdown>
                {answerLoading && <span className="typing-cursor">▌</span>}
              </div>
              {!answerLoading && (
                <p className="ai-answer-footer">
                  * Ответ сформирован на основе {documents.length} источников
                </p>
              )}
            </div>
          )}

          {error && <div className="inline-error">{error}</div>}

          {!docsLoading && documents.length > 0 && (
            <h3 className="relevant-docs-title">Релевантные документы</h3>
          )}

          {!docsLoading && documents.length === 0 && !error && (
            <div className="empty-search-block">
              <i className="fa fa-search empty-search-icon" />
              <h3 className="empty-search-title">Документы не найдены</h3>
              <p className="empty-search-msg">
                По запросу «{query}» ничего не найдено в архиве
              </p>
            </div>
          )}

          {documents.map((doc) => (
            <DocCard key={doc.id} doc={doc} query={query} userId={userId} />
          ))}
        </div>

        {documents.length > 0 && (
          <div className="search-results-sidebar">
            <h4 className="sources-title">Источники</h4>
            {documents.map((doc, i) => (
              <SourceItem
                key={doc.id}
                doc={doc}
                isLast={i === documents.length - 1}
                query={query}
                userId={userId}
              />
            ))}
            <div className="sources-tip">
              <i className="fas fa-lightbulb"></i> <strong>Совет:</strong>{" "}
              Кликните на источник, чтобы увидеть полный контекст.
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchResults;
