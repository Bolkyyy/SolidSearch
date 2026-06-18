import { useEffect, useState, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Layout from "../../components/Layout/Layout";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Document, documentsApi } from "@/api/documentsApi";

interface IndexJob {
  id: number;
  status: string;
  parser_type: string;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
}

const API_URL = "http://localhost:3001";
const PAGE_SIZE = 20_000;

function paginateText(text: string): string[] {
  if (text.length <= PAGE_SIZE) return [text];
  const pages: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + PAGE_SIZE, text.length);
    if (end < text.length) {
      const lastNl = text.lastIndexOf("\n", end);
      if (lastNl > start + PAGE_SIZE * 0.5) end = lastNl + 1;
    }
    pages.push(text.slice(start, end));
    start = end;
  }
  return pages;
}

const DocumentCard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [documentData, setDocumentData] = useState<Document | null>(null);
  const [textPage, setTextPage] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const textScrollRef = useRef<HTMLDivElement>(null);
  const file = documentData?.files?.[0];

  const IMAGE_EXTS = ["png", "jpg", "jpeg", "tiff", "tif", "webp", "bmp", "gif"];
  const fileExt = (file?.file_name || "").split(".").pop()?.toLowerCase() || "";
  const isImage =
    !!file &&
    (file.file_type?.startsWith("image/") ||
      IMAGE_EXTS.includes((documentData?.document_type || "").toLowerCase()) ||
      IMAGE_EXTS.includes(fileExt));
  const fileUrl = documentData
    ? `http://localhost:3001/documents/${documentData.id}/preview`
    : "";

  const textPages = useMemo(
    () => (file?.extracted_text ? paginateText(file.extracted_text) : []),
    [file?.extracted_text],
  );
  const totalPages = textPages.length;

  useEffect(() => {
    if (!imageModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImageModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [imageModalOpen]);

  const [jobs, setJobs] = useState<IndexJob[]>([]);
  const [notFound, setNotFound] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const docNavState = location.state as {
    returnQuery?: string;
    returnUserId?: number;
    returnFilters?: Record<string, string>;
    returnDocsPage?: number;
  } | null;

  const params = useParams();
  const documentId = params.id;

  async function getDocument() {
    try {
      const [data, jobsRes] = await Promise.all([
        documentsApi.getById(Number(documentId)),
        documentsApi.getJobs(Number(documentId)),
      ]);
      setDocumentData(data);
      setJobs(jobsRes);
      setTextPage(0);
      setNotFound(false);
    } catch (e) {
      console.error("Error fetching document:", e);
      setNotFound(true);
    }
  }

  const formatDateOnly = (iso?: string) => {
    if (!iso) return "—";
    const date = new Date(iso);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDate = (iso: string) => {
    const date = new Date(new Date(iso).getTime() + 3 * 60 * 60 * 1000);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  useEffect(() => {
    if (!documentId) {
      setNotFound(true);
      return;
    }
    getDocument();
  }, []);

  if (notFound) {
    return (
      <Layout>
        <div className="document-card-page">
          <button
            className="back-button"
            onClick={() => {
              if (docNavState?.returnQuery) {
                navigate("/search/results", {
                  state: {
                    query: docNavState.returnQuery,
                    userId: docNavState.returnUserId ?? 0,
                    filters: docNavState.returnFilters ?? {},
                    docsPage: docNavState.returnDocsPage ?? 1,
                  },
                });
              } else {
                navigate(-1);
              }
            }}
          >
            <i className="fa fa-arrow-left"></i> Назад к результатам
          </button>
          <div className="empty-state-center">
            <h2>Документ не найден</h2>
            <p>
              Возможно, он был удалён или вы перешли по некорректной ссылке.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="document-card-page">
        <button
          onClick={() => {
            if (docNavState?.returnQuery) {
              navigate("/search/results", {
                state: {
                  query: docNavState.returnQuery,
                  userId: docNavState.returnUserId ?? 0,
                  filters: docNavState.returnFilters ?? {},
                },
              });
            } else {
              navigate(-1);
            }
          }}
          className="back-button"
        >
          <i className="fa fa-arrow-left"></i> Назад к результатам поиска
        </button>

        {/* Заголовок документа */}
        <div className="document-header">
          <h1>{documentData?.title}</h1>
          <div className="document-type">
            {documentData?.document_type} •{" "}
            {formatDateOnly(documentData?.document_date)}
          </div>
        </div>

        {/* Вкладки */}
        <div className="document-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Обзор
          </button>
          {/* <button
            className={`tab-btn ${activeTab === "fragments" ? "active" : ""}`}
            onClick={() => setActiveTab("fragments")}
          >
            Фрагменты
          </button> */}
          <button
            className={`tab-btn ${activeTab === "fulltext" ? "active" : ""}`}
            onClick={() => setActiveTab("fulltext")}
          >
            Полный текст
          </button>
          <button
            className={`tab-btn ${activeTab === "metadata" ? "active" : ""}`}
            onClick={() => setActiveTab("metadata")}
          >
            Метаданные
          </button>
          <button
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            История
          </button>

          <a
            href={
              documentData
                ? `${API_URL}/documents/${documentId}/download`
                : undefined
            }
            className={`tab-btn download-btn-tab${!documentData ? " disabled" : ""}`}
            onClick={(e) => !documentData && e.preventDefault()}
          >
            <i
              className="fa fa-cloud-download btn-icon-prefix"
              aria-hidden="true"
            ></i>
            Скачать
          </a>
        </div>

        <div className="document-layout">
          {/* Левая колонка - основной контент */}
          <div className="document-content">
            {/* Контент вкладок */}
            <div className="tab-content">
              {/* Обзор */}
              {activeTab === "overview" && (
                <div className="overview-tab">
                  <div className="overview-card">
                    <h2>Обзор документа</h2>
                    <div className="overview-content">
                      {file?.normalized_text ? (
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {file.normalized_text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <>
                          <div className="overview-section">
                            <p> Обзор документа не доступен </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Фрагменты */}
              {/* {activeTab === "fragments" && (
                <div className="fragments-tab">
                  <div className="key-fragments">
                    <h2>Ключевые фрагменты</h2>

                    <div className="fragment-item">
                      <div className="fragment-header">
                        <span className="fragment-page">Страница 1</span>
                        <span className="fragment-relevance">
                          95% релевантность
                        </span>
                      </div>
                      <p className="fragment-text">
                        Договор на выполнение работ по капитальному ремонту
                        железнодорожных путей участка км 15-25 общей
                        протяженностью 10 км
                      </p>
                    </div>

                    <div className="fragment-item">
                      <div className="fragment-header">
                        <span className="fragment-page">Страница 3</span>
                        <span className="fragment-relevance">
                          89% релевантность
                        </span>
                      </div>
                      <p className="fragment-text">
                        Общая стоимость работ составляет 12 500 000 (двенадцать
                        миллионов пятьсот тысяч) рублей
                      </p>
                    </div>

                    <div className="fragment-item">
                      <div className="fragment-header">
                        <span className="fragment-page">Страница 5</span>
                        <span className="fragment-relevance">
                          82% релевантность
                        </span>
                      </div>
                      <p className="fragment-text">
                        Срок выполнения работ: с 01.04.2019 по 31.08.2019
                      </p>
                    </div>
                  </div>
                </div>
              )} */}

              {/* Полный текст */}
              {activeTab === "fulltext" && (
                <div className="fulltext-tab">
                  <div className="fulltext-content">
                    <h2>{documentData?.title}</h2>
                    {isImage ? (
                      <>
                        <button
                          className="doc-image-zoom-btn"
                          onClick={() => setImageModalOpen(true)}
                        >
                          <i className="fa fa-expand" /> Открыть картинку
                        </button>
                        <div className="doc-image-preview">
                          <img
                            src={fileUrl}
                            alt={documentData?.title}
                            onClick={() => setImageModalOpen(true)}
                          />
                        </div>
                      </>
                    ) : textPages.length > 0 ? (
                      <>
                        <div className="markdown-body doc-fulltext" ref={textScrollRef}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {textPages[textPage]}
                          </ReactMarkdown>
                        </div>
                        {totalPages > 1 && (
                          <div className="doc-pagination">
                            <button
                              className="doc-page-btn"
                              onClick={() => { setTextPage((p) => Math.max(0, p - 1)); textScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }}
                              disabled={textPage === 0}
                            >
                              <i className="fa fa-chevron-left" /> Назад
                            </button>
                            <span className="doc-page-info">
                              Страница {textPage + 1} из {totalPages}
                            </span>
                            <button
                              className="doc-page-btn"
                              onClick={() => { setTextPage((p) => Math.min(totalPages - 1, p + 1)); textScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }}
                              disabled={textPage === totalPages - 1}
                            >
                              Далее <i className="fa fa-chevron-right" />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p>Текст документа недоступен</p>
                    )}
                  </div>
                </div>
              )}

              {/* Метаданные */}
              {activeTab === "metadata" && (
                <div className="metadata-tab">
                  <div className="metadata-grid">
                    <div className="metadata-item">
                      <span className="metadata-label">Формат файла</span>
                      <span className="metadata-value">
                        {documentData?.document_type || "Неизвестно"}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Количество страниц</span>
                      <span className="metadata-value">
                        {file?.page_count || "Неизвестно"}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Загружен</span>
                      <span className="metadata-value">
                        {documentData?.created_at ? formatDate(documentData.created_at) : "—"}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Проиндексирован</span>
                      <span className="metadata-value">
                        {file?.uploaded_at ? formatDate(file.uploaded_at) : "—"}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Размер файла</span>
                      <span className="metadata-value">
                        {file
                          ? (file.file_size / 1024 / 1024).toFixed(2)
                          : "--"}{" "}
                        MB
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Язык</span>
                      <span className="metadata-value">
                        {documentData?.language || "Неизвестно"}
                      </span>
                    </div>
                    {/* <div className="metadata-item">
                      <span className="metadata-label">
                        Последнее изменение
                      </span>
                      <span className="metadata-value">
                        20.03.2019 10:15 - мок{" "}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Вектор модель</span>
                      <span className="metadata-value">
                        text-embedding-ada-002 - мок
                      </span>
                    </div> */}
                  </div>
                </div>
              )}

              {/* История */}
              {activeTab === "history" && (
                <div className="history-tab">
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-dot timeline-dot--upload"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Документ загружен</div>
                        <div className="timeline-date">
                          {documentData?.created_at ? formatDate(documentData.created_at) : "—"}
                        </div>
                      </div>
                    </div>
                    {jobs.map((job, i) => (
                      <div key={job.id}>
                        <div className="timeline-item">
                          <div className="timeline-dot timeline-dot--start"></div>
                          <div className="timeline-content">
                            <div className="timeline-title">
                              {i === 0 ? "Индексация начата" : `Переиндексация #${i + 1}`}
                            </div>
                            <div className="timeline-date">{formatDate(job.started_at)}</div>
                            {job.parser_type && (
                              <div className="timeline-meta">{job.parser_type}</div>
                            )}
                          </div>
                        </div>
                        {job.finished_at && (
                          <div className="timeline-item">
                            <div className={`timeline-dot timeline-dot--${job.status === 'completed' ? 'done' : 'error'}`}></div>
                            <div className="timeline-content">
                              <div className="timeline-title">
                                {job.status === 'completed' ? 'Индексация завершена' : 'Ошибка индексации'}
                              </div>
                              <div className="timeline-date">{formatDate(job.finished_at)}</div>
                              {job.error_message && (
                                <div className="timeline-meta timeline-meta--error">{job.error_message}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {jobs.length === 0 && (
                      <div className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <div className="timeline-title">История индексации недоступна</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка - фиксированная информация */}
          <div className="document-sidebar">
            {/* Основная информация */}
            {documentData && (
              <div className="info-section">
                <h2>Основная информация</h2>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Название документа:</span>
                    <span className="info-value">{documentData.title}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Тип:</span>
                    <span className="info-value">
                      {documentData.document_type}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Дата:</span>
                    <span className="info-value">
                      {formatDateOnly(documentData.document_date)}
                    </span>
                  </div>
                  {/* <div className="info-row">
                    <span className="info-label">Номер:</span>
                    <span className="info-value">
                      {documentData.archive_number || "Неизвестно"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ответственное лицо:</span>
                    <span className="info-value">
                      'В таблице нет такой информации'
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Сумма:</span>
                    <span className="info-value">
                      'В таблице нет такой информации'
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Подрядчик:</span>
                    <span className="info-value">
                      {documentData.author_name || "Нет информации"}
                    </span>
                  </div> */}
                </div>
              </div>
            )}

            {/* Связанные сущности */}
            {/* {documentData && (
              <div className="related-section">
                <h2>Связанные сущности</h2>
                <div className="related-grid">
                  <div className="related-item">
                    <span className="related-label">Подрядчик</span>
                    <span className="related-value">
                      {documentData.author_name || "Нет информации"}
                    </span>
                  </div>
                  <div className="related-item">
                    <span className="related-label">Акт приемки</span>
                    <span className="related-value">Нет информации</span>
                  </div>
                  <div className="related-item">
                    <span className="related-label">Смета</span>
                    <span className="related-value">Нет информации</span>
                  </div>
                  <div className="related-item">
                    <span className="related-label">Ответственный</span>
                    <span className="related-value">Нет информации</span>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {isImage && imageModalOpen && (
        <div
          className="image-modal-overlay"
          onClick={() => setImageModalOpen(false)}
        >
          <button
            className="image-modal-close"
            onClick={() => setImageModalOpen(false)}
            title="Закрыть"
          >
            <i className="fa fa-times" />
          </button>
          <img
            className="image-modal-img"
            src={fileUrl}
            alt={documentData?.title}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Layout>
  );
};

export default DocumentCard;
