import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Layout from "../../components/Layout/Layout";
import type { SearchDocument } from "../../interfaces/SearchPageInterface";
import { searchApi } from "@/api/searchApi";

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
  filters,
  docsPage,
}: {
  doc: SearchDocument;
  query: string;
  userId: number;
  filters: SearchFilters;
  docsPage: number;
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
        state={{ returnQuery: query, returnUserId: userId, returnFilters: filters, returnDocsPage: docsPage }}
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
  filters,
  docsPage,
}: {
  doc: SearchDocument;
  isLast: boolean;
  query: string;
  userId: number;
  filters: SearchFilters;
  docsPage: number;
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
      state={{ returnQuery: query, returnUserId: userId, returnFilters: filters, returnDocsPage: docsPage }}
      className="router-link"
    >
      <span className="source-item-link">
        <i className="fa fa-folder-open" aria-hidden="true"></i> Открыть
        документ
      </span>
    </Link>
  </div>
);

interface SearchFilters {
  period?: string;
  source?: string;
  format?: string;
  formats?: string;
  collection?: string;
}

const FILTER_LABELS: Record<string, string> = {
  period: "Период",
  source: "Источник",
  format: "Формат",
  formats: "Форматы",
  collection: "Коллекция",
};

const ActiveFiltersInfo = ({ filters }: { filters: SearchFilters }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const active = Object.entries(filters).filter(
    ([, v]) => v && v !== "all",
  ) as [string, string][];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (active.length === 0) return null;

  return (
    <div className="active-filters-info" ref={ref}>
      <button
        className="active-filters-btn"
        onClick={() => setOpen((p) => !p)}
        title="Активные фильтры"
      >
        <i className="fa fa-filter" />
        <span className="active-filters-count">{active.length}</span>
      </button>
      {open && (
        <div className="active-filters-popup">
          <div className="active-filters-popup-title">Активные фильтры</div>
          {active.map(([key, val]) => (
            <div key={key} className="active-filters-popup-row">
              <span className="active-filters-popup-key">
                {FILTER_LABELS[key]}
              </span>
              <span className="active-filters-popup-val">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DOCS_PER_PAGE = 5;

function getPageNums(current: number, total: number): (number | "...")[] {
  if (total <= 1) return [1];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "...")[] = [1];
  if (current > 3) items.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) items.push(i);
  if (current < total - 2) items.push("...");
  items.push(total);
  return items;
}

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state as {
    query: string;
    userId: number;
    filters?: SearchFilters;
    docsPage?: number;
  } | null;

  const query: string = navState?.query ?? "";
  const userId: number = navState?.userId ?? 0;
  const filters: SearchFilters = navState?.filters ?? {};
  const cacheKey = `sr_${query}_${JSON.stringify(filters)}`;

  const [documents, setDocuments] = useState<SearchDocument[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [searching, setSearching] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [error, setError] = useState("");
  const [docsPage, setDocsPage] = useState(() => {
    if (navState?.docsPage) return navState.docsPage;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) return JSON.parse(raw)?.docsPage ?? 1;
    } catch {}
    return 1;
  });
  const docsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (!raw) return;
      const cached = JSON.parse(raw);
      sessionStorage.setItem(cacheKey, JSON.stringify({ ...cached, docsPage }));
    } catch {}
  }, [docsPage]);

  useEffect(() => {
    if (!query) return;

    const controller = new AbortController();
    let liveDocs: SearchDocument[] = [];
    let liveAnswer = "";

    const run = async () => {
      const localRaw = sessionStorage.getItem(cacheKey);
      if (localRaw) {
        try {
          const local = JSON.parse(localRaw);
          if (local?.documents?.length || local?.answer) {
            setDocuments(local.documents ?? []);
            setAnswer(local.answer ?? "");
            setSearching(false);
            setDocsLoading(false);
            return;
          }
        } catch {}
      }

      try {
        const cached = await searchApi.getCached(query, userId, filters, controller.signal);
        if (cached) {
          setSearching(false);
          setDocsLoading(false);
          setDocuments(cached.documents ?? []);
          setAnswer(cached.answer ?? "");
          sessionStorage.setItem(cacheKey, JSON.stringify({ documents: cached.documents ?? [], answer: cached.answer ?? "" }));
          return;
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }

      try {
        const reader = await searchApi.stream(query, userId, filters, controller.signal);
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
                setDocsPage(1);
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
                sessionStorage.setItem(cacheKey, JSON.stringify({ documents: liveDocs, answer: liveAnswer }));
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

    run();
    return () => controller.abort();
  }, [query, JSON.stringify(filters)]);

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
            <div className="search-results-heading-right">
              <span className="search-results-count">
                {docsLoading ? "Поиск…" : `Найдено: ${documents.length}`}
              </span>
              <ActiveFiltersInfo filters={filters} />
            </div>
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

          {!docsLoading && documents.length > 0 && (() => {
            const totalDocPages = Math.ceil(documents.length / DOCS_PER_PAGE);
            const pagedDocs = documents.slice(
              (docsPage - 1) * DOCS_PER_PAGE,
              docsPage * DOCS_PER_PAGE,
            );
            return (
              <>
                <div ref={docsListRef}>
                  {pagedDocs.map((doc) => (
                    <DocCard key={doc.id} doc={doc} query={query} userId={userId} filters={filters} docsPage={docsPage} />
                  ))}
                </div>
                {totalDocPages > 1 && (
                  <div className="history-pagination">
                    <span className="history-pagination-info">
                      {(docsPage - 1) * DOCS_PER_PAGE + 1}–{Math.min(docsPage * DOCS_PER_PAGE, documents.length)} из {documents.length} документов
                    </span>
                    <div className="history-pagination-controls">
                      <button
                        className="history-page-btn history-page-arrow"
                        disabled={docsPage === 1}
                        onClick={() => { setDocsPage(1); docsListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                        title="В начало"
                      >
                        <i className="fa fa-angle-double-left" />
                      </button>
                      <button
                        className="history-page-btn history-page-arrow"
                        disabled={docsPage === 1}
                        onClick={() => { setDocsPage(docsPage - 1); docsListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                        title="Предыдущая"
                      >
                        <i className="fa fa-chevron-left" />
                      </button>
                      {getPageNums(docsPage, totalDocPages).map((item, idx) =>
                        item === "..." ? (
                          <span key={`e${idx}`} className="history-page-btn" style={{ cursor: "default", opacity: 0.4 }}>…</span>
                        ) : (
                          <button
                            key={item}
                            className={`history-page-btn${docsPage === item ? " active" : ""}`}
                            onClick={() => { setDocsPage(item as number); docsListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                          >
                            {item}
                          </button>
                        ),
                      )}
                      <button
                        className="history-page-btn history-page-arrow"
                        disabled={docsPage === totalDocPages}
                        onClick={() => { setDocsPage(docsPage + 1); docsListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                        title="Следующая"
                      >
                        <i className="fa fa-chevron-right" />
                      </button>
                      <button
                        className="history-page-btn history-page-arrow"
                        disabled={docsPage === totalDocPages}
                        onClick={() => { setDocsPage(totalDocPages); docsListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                        title="В конец"
                      >
                        <i className="fa fa-angle-double-right" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {documents.length > 0 && (() => {
          const pagedDocs = documents.slice(
            (docsPage - 1) * DOCS_PER_PAGE,
            docsPage * DOCS_PER_PAGE,
          );
          return (
          <div className="search-results-sidebar">
            <h4 className="sources-title">Источники</h4>
            {pagedDocs.map((doc, i) => (
              <SourceItem
                key={doc.id}
                doc={doc}
                isLast={i === pagedDocs.length - 1}
                query={query}
                userId={userId}
                filters={filters}
                docsPage={docsPage}
              />
            ))}
            <div className="sources-tip">
              <i className="fas fa-lightbulb"></i> <strong>Совет:</strong>{" "}
              Кликните на источник, чтобы увидеть полный контекст.
            </div>
          </div>
          );
        })()}
      </div>
    </Layout>
  );
};

export default SearchResults;
