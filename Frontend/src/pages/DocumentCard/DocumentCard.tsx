import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import Layout from "../../components/Layout/Layout";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Document, DocumentsApi } from "@/api/documentsApi";

const DocumentCard = () => {
  const [activeTab, setActiveTab] = useState("overview"); // overview, fragments, fulltext, metadata, history
  const [documentData, setDocumentData] = useState<Document | null>(null);
  const file = documentData?.files?.[0];
  // const meta = documentData?.metadata?.[0];

  const [notFound, setNotFound] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const docNavState = location.state as { returnQuery?: string; returnUserId?: number } | null;

  const params = useParams();
  const documentId = params.id;

  async function getDocument() {
    try {
      const data = await DocumentsApi.getById(Number(documentId));
      setDocumentData(data);
      setNotFound(false);
    } catch (e) {
      console.error("Error fetching document:", e);
      setNotFound(true);
    }
  }

  const formatDateOnly = (iso?: string) => {
    if (!iso) return '—';
    const date = new Date(iso);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
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
                  state: { query: docNavState.returnQuery, userId: docNavState.returnUserId ?? 0 },
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

          {/* Новая кнопка скачивания */}
          <button className="tab-btn download-btn-tab">
            <i
              className="fa fa-cloud-download btn-icon-prefix"
              aria-hidden="true"
            ></i>
            Скачать
          </button>
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
                          <ReactMarkdown>{file.normalized_text}</ReactMarkdown>
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
                    {file?.extracted_text ? (
                      <div className="markdown-body">
                        <ReactMarkdown>{file.extracted_text}</ReactMarkdown>
                      </div>
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
                      <span className="metadata-label">Создан</span>
                      <span className="metadata-value">
                        {formatDate(documentData?.created_at || "Неизвестно")}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Проиндексирован</span>
                      <span className="metadata-value">
                        21.03.2019 02:45 - мок
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
                    <div className="metadata-item last-item">
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
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Документ создан</div>
                        <div className="timeline-date">15.03.2019 14:30</div>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Добавлен в архив</div>
                        <div className="timeline-date">
                          Петрова М.А. 20.03.2019 10:15
                        </div>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Проиндексирован</div>
                        <div className="timeline-date">
                          Система: 21.03.2019 02:45
                        </div>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Просмотр</div>
                        <div className="timeline-date">
                          Иванов П.С. 26.03.2020 15:22
                        </div>
                      </div>
                    </div>
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
    </Layout>
  );
};

export default DocumentCard;