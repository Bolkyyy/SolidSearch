import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { documentsApi, Document, CollectionStats } from "@/api/documentsApi";
import { collectionsApi, Collection } from "@/api/collectionsApi";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import ErrorModal from "../../components/ErrorModal/ErrorModal";
const PAGE_SIZE = 10;

const CollectionDetail = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const appliedSearchRef = useRef("");
  const appliedTypeRef = useRef("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [addSearch, setAddSearch] = useState("");
  const [adding, setAdding] = useState<number | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);

  const [togglingActive, setTogglingActive] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [reindexDone, setReindexDone] = useState(false);
  const [reindexActive, setReindexActive] = useState(() => {
    try {
      const saved = localStorage.getItem("activeReindexIds");
      const ids: number[] = saved ? JSON.parse(saved) : [];
      return ids.includes(Number(collectionId));
    } catch {
      return false;
    }
  });
  const [cancelling, setCancelling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Document | null>(null);
  const [removing, setRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!showMoreDropdown) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMoreDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMoreDropdown]);

  const id = Number(collectionId);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const setActiveReindex = (active: boolean) => {
    try {
      const saved = localStorage.getItem("activeReindexIds");
      const ids: number[] = saved ? JSON.parse(saved) : [];
      const next = active
        ? [...new Set([...ids, id])]
        : ids.filter((x) => x !== id);
      localStorage.setItem("activeReindexIds", JSON.stringify(next));
    } catch {}
    setReindexActive(active);
  };

  useEffect(() => {
    if (!reindexActive) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const s = await documentsApi.reindexStatus(id);
        if (!s.active) setActiveReindex(false);
      } catch {}
    }, 5000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [reindexActive, id]);

  const fetchDocs = async (page: number, search: string, type: string) => {
    setDocsLoading(true);
    try {
      const result = await documentsApi.getByCollectionId(
        id,
        page,
        PAGE_SIZE,
        search,
        type,
      );
      setDocuments(result.data);
      setTotalCount(result.total);
    } catch (e) {
      console.error("Ошибка загрузки документов", e);
    } finally {
      setDocsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const s = await documentsApi.getCollectionStats(id);
      setStats(s);
    } catch {}
  };

  const handleToggleActive = async () => {
    if (!collection) return;
    setTogglingActive(true);
    try {
      await collectionsApi.setActive(id, !collection.is_active);
      setCollection((prev) =>
        prev ? { ...prev, is_active: !prev.is_active } : prev,
      );
    } catch {
      setErrorMessage("Не удалось изменить статус коллекции.");
    } finally {
      setTogglingActive(false);
    }
  };

  const handleReindex = async () => {
    if (!id) return;
    setReindexing(true);
    setReindexDone(false);
    try {
      await documentsApi.reindexCollection(id);
      setReindexDone(true);
      setActiveReindex(true);
      setTimeout(() => setReindexDone(false), 3000);
    } catch {
      setErrorMessage("Не удалось запустить переиндексацию.");
    } finally {
      setReindexing(false);
    }
  };

  const handleCancelReindex = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      await documentsApi.cancelReindex(id);
      setActiveReindex(false);
    } catch {
      setErrorMessage("Не удалось отменить переиндексацию.");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    if (!id) {
      navigate("/collections");
      return;
    }

    const load = async () => {
      try {
        const [colRes, statsRes, docsRes] = await Promise.allSettled([
          collectionsApi.getAll(),
          documentsApi.getCollectionStats(id),
          documentsApi.getByCollectionId(id, 1, PAGE_SIZE, "", "all"),
        ]);

        if (colRes.status === "rejected") {
          setLoadError(
            `Ошибка загрузки коллекций: ${colRes.reason?.message ?? "неизвестная ошибка"}`,
          );
          return;
        }

        const found = colRes.value.find((c: Collection) => c.id === id);
        if (!found) {
          setLoadError(`Коллекция #${id} не найдена в базе данных`);
          return;
        }
        setCollection(found);

        if (statsRes.status === "fulfilled") setStats(statsRes.value);

        if (docsRes.status === "fulfilled") {
          setDocuments(docsRes.value.data);
          setTotalCount(docsRes.value.total);
        } else {
          setLoadError(
            `Ошибка загрузки документов: ${docsRes.reason?.response?.data?.message ?? docsRes.reason?.message ?? "неизвестная ошибка"}`,
          );
        }
      } catch (e: any) {
        setLoadError(e?.message ?? "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      appliedSearchRef.current = value;
      setCurrentPage(1);
      fetchDocs(1, value, appliedTypeRef.current);
    }, 300);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setShowMoreDropdown(false);
    appliedTypeRef.current = type;
    setCurrentPage(1);
    fetchDocs(1, appliedSearchRef.current, type);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchDocs(page, appliedSearchRef.current, appliedTypeRef.current);
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openAddModal = async () => {
    setShowAddModal(true);
    setLoadingAll(true);
    try {
      const all = await documentsApi.getAll();
      setAllDocuments(all.filter((d) => !d.collection_id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAll(false);
    }
  };

  const handleAddDocument = async (doc: Document) => {
    setAdding(doc.id);
    try {
      await documentsApi.addToCollection(doc.id, id);
      setAllDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      await Promise.all([
        fetchDocs(
          currentPage,
          appliedSearchRef.current,
          appliedTypeRef.current,
        ),
        fetchStats(),
      ]);
    } catch {
      setErrorMessage(
        "Не удалось добавить документ в коллекцию. Проверьте соединение с сервером и попробуйте снова.",
      );
    } finally {
      setAdding(null);
    }
  };

  const handleConfirmRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await documentsApi.addToCollection(removeTarget.id, 0);
      setRemoveTarget(null);
      const nextPage =
        documents.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;
      if (nextPage !== currentPage) setCurrentPage(nextPage);
      await Promise.all([
        fetchDocs(nextPage, appliedSearchRef.current, appliedTypeRef.current),
        fetchStats(),
      ]);
    } catch {
      console.error("Ошибка при удалении документа из коллекции");
    } finally {
      setRemoving(false);
    }
  };

  const getFileIcon = (type: string) => {
    const icons: Record<string, string> = {
      PDF: "fa-file-pdf-o",
      DOCX: "fa-file-word-o",
      DOC: "fa-file-word-o",
      TXT: "fa-file-text-o",
      XLSX: "fa-file-excel-o",
      PPTX: "fa-file-powerpoint-o",
    };
    return icons[type?.toUpperCase()] || "fa-file-o";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return (
          <span className="status-success">
            <i className="fa fa-check-circle" /> Индексирован
          </span>
        );
      case "processing":
        return (
          <span className="status-warning">
            <i className="fa fa-spinner fa-spin" /> Обработка
          </span>
        );
      case "extraction_failed":
        return (
          <span className="status-error">
            <i className="fa fa-exclamation-circle" /> Ошибка
          </span>
        );
      default:
        return (
          <span className="status-warning">
            <i className="fa fa-clock-o" /> Ожидание
          </span>
        );
    }
  };

  const getTotalSize = (files: Document["files"]) => {
    if (!files?.length) return "—";
    const total = files.reduce((sum, f) => sum + (f.file_size || 0), 0);
    if (total === 0) return "—";
    if (total < 1024) return `${total} Б`;
    if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} КБ`;
    return `${(total / 1024 / 1024).toFixed(1)} МБ`;
  };

  const getDocType = (doc: Document) =>
    doc.document_type || doc.files?.[0]?.file_type || "—";

  const availableTypes = stats?.types ?? [];

  const filteredAddDocs = allDocuments.filter((doc) =>
    doc.title?.toLowerCase().includes(addSearch.toLowerCase()),
  );

  const pageFrom = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageTo = Math.min(currentPage * PAGE_SIZE, totalCount);

  if (loading) {
    return (
      <Layout>
        <div className="page-loading-state">
          <i className="fa fa-spinner fa-spin fa-2x" />
          <p>Загрузка...</p>
        </div>
      </Layout>
    );
  }

  if (loadError) {
    return (
      <Layout>
        <div className="page-error-state">
          <i className="fa fa-exclamation-triangle fa-3x page-error-icon" />
          <p className="page-error-text">{loadError}</p>
          <Link to="/collections" className="page-error-link">
            ← Вернуться к коллекциям
          </Link>
        </div>
      </Layout>
    );
  }

  if (!collection) return null;

  return (
    <Layout>
      <div className="collection-detail-container">
        <div className="breadcrumbs">
          <Link to="/collections">Коллекции</Link>
          <i className="fa fa-chevron-right" />
          <span>{collection.name}</span>
        </div>

        {!collection.is_active && (
          <div className="collection-inactive-banner">
            <i className="fa fa-lock" />
            <span>
              Коллекция деактивирована — добавление документов недоступно.
              Активируйте коллекцию чтобы продолжить работу.
            </span>
          </div>
        )}

        <div className="collection-header-detail">
          <div className="collection-header-content">
            <div className="collection-title-section">
              <h1>
                <i className="fa fa-folder-open heading-icon" />
                {collection.name}
              </h1>
              <p className="collection-description">{collection.description}</p>
              <div className="collection-meta">
                <span>
                  <i className="fa fa-file-text-o" /> {stats?.total ?? 0}{" "}
                  документов
                </span>
                <span
                  className={`collection-status-badge ${collection.is_active ? "collection-status-badge--active" : "collection-status-badge--inactive"}`}
                >
                  <i
                    className={`fa fa-${collection.is_active ? "check-circle" : "ban"}`}
                  />
                  {collection.is_active ? "Активна" : "Неактивна"}
                </span>
              </div>
            </div>
            <div className="collection-actions-detail">
              <button
                className="btn-upload"
                onClick={openAddModal}
                disabled={!collection.is_active}
                title={
                  !collection.is_active ? "Коллекция деактивирована" : undefined
                }
              >
                <i className="fa fa-plus" /> Добавить документ
              </button>
              <button
                className="btn-reindex-detail"
                onClick={handleReindex}
                disabled={reindexing || reindexActive}
              >
                <i
                  className={`fa ${reindexing ? "fa-spinner fa-spin" : reindexDone ? "fa-check" : "fa-refresh"}`}
                />{" "}
                {reindexing
                  ? "Запуск..."
                  : reindexDone
                    ? "Запущено!"
                    : "Переиндексировать"}
              </button>
              <a
                className="btn-reindex-detail"
                style={{ textDecoration: "none" }}
                href={`http://localhost:3001/documents/collection/${id}/download`}
              >
                <i className="fa fa-download" /> Скачать архив
              </a>
              <button
                className={`btn-toggle-active${collection.is_active ? " btn-toggle-active--on" : " btn-toggle-active--off"}`}
                onClick={handleToggleActive}
                disabled={togglingActive}
                title={
                  collection.is_active
                    ? "Деактивировать коллекцию"
                    : "Активировать коллекцию"
                }
              >
                {togglingActive ? (
                  <i className="fa fa-spinner fa-spin" />
                ) : (
                  <i
                    className={`fa fa-${collection.is_active ? "toggle-on" : "toggle-off"}`}
                  />
                )}{" "}
                {collection.is_active ? "Деактивировать" : "Активировать"}
              </button>
            </div>
          </div>
        </div>

        <div className="stats-mini-grid">
          <div className="stat-mini-card total">
            <div className="stat-mini-value">{stats?.total ?? 0}</div>
            <div className="stat-mini-label">Всего документов</div>
          </div>
          <div className="stat-mini-card indexed">
            <div className="stat-mini-value">{stats?.processed ?? 0}</div>
            <div className="stat-mini-label">Проиндексировано</div>
          </div>
          <div className="stat-mini-card processing">
            <div className="stat-mini-value">{stats?.processing ?? 0}</div>
            <div className="stat-mini-label">В обработке</div>
          </div>
          <div className="stat-mini-card errors">
            <div className="stat-mini-value">{stats?.failed ?? 0}</div>
            <div className="stat-mini-label">Ошибки</div>
          </div>
        </div>

        {reindexActive && (
          <div className="reindex-progress-banner">
            <i className="fa fa-spinner fa-spin" />
            <span>Переиндексация выполняется...</span>
            <button
              className="btn-cancel-reindex"
              onClick={handleCancelReindex}
              disabled={cancelling}
            >
              <i
                className={`fa ${cancelling ? "fa-spinner fa-spin" : "fa-times"}`}
              />
              {cancelling ? "Отмена..." : "Отменить переиндексацию"}
            </button>
          </div>
        )}

        <div className="documents-controls">
          <div className="search-box">
            <i className="fa fa-search" />
            <input
              type="text"
              placeholder="Поиск по документам..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="filter-buttons-group">
            <button
              className={`filter-btn ${selectedType === "all" ? "active" : ""}`}
              onClick={() => handleTypeChange("all")}
            >
              Все
            </button>
            {availableTypes.slice(0, 5).map((type) => (
              <button
                key={type}
                className={`filter-btn ${selectedType === type ? "active" : ""}`}
                onClick={() => handleTypeChange(type)}
              >
                {type}
              </button>
            ))}
            {availableTypes.length > 5 && (
              <div className="filter-more-wrap" ref={moreRef}>
                <button
                  className={`filter-btn filter-btn-more ${
                    availableTypes.slice(5).includes(selectedType)
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setShowMoreDropdown((v) => !v)}
                >
                  {availableTypes.slice(5).includes(selectedType)
                    ? selectedType
                    : "Другие"}
                  <i
                    className={`fa fa-chevron-${showMoreDropdown ? "up" : "down"} filter-chevron`}
                  />
                </button>
                {showMoreDropdown && (
                  <div className="filter-more-dropdown">
                    {availableTypes.slice(5).map((type) => (
                      <button
                        key={type}
                        className={`filter-more-item ${selectedType === type ? "active" : ""}`}
                        onClick={() => handleTypeChange(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="documents-table-wrapper" ref={tableRef}>
          {docsLoading && (
            <div className="docs-page-loading">
              <i className="fa fa-spinner fa-spin" /> Загрузка...
            </div>
          )}
          <table
            className={`documents-table${docsLoading ? " docs-table--faded" : ""}`}
          >
            <thead>
              <tr>
                <th>Название</th>
                <th>Тип</th>
                <th>Файлов</th>
                <th>Размер</th>
                <th>Дата документа</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 && !docsLoading ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <i className="fa fa-inbox" />
                    <p>Документы не найдены</p>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => navigate(`/document/${doc.id}`)}
                    className="tr-clickable"
                    title="Открыть документ"
                  >
                    <td>
                      <div className="doc-name-cell">
                        <i className={`fa ${getFileIcon(getDocType(doc))}`} />
                        <span>{doc.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="doc-type-badge">
                        {getDocType(doc).toUpperCase()}
                      </span>
                    </td>
                    <td className="td-center">{doc.files?.length ?? 0}</td>
                    <td>{getTotalSize(doc.files)}</td>
                    <td>
                      {doc.document_date
                        ? new Date(doc.document_date).toLocaleDateString(
                            "ru-RU",
                          )
                        : doc.created_at
                          ? new Date(doc.created_at).toLocaleDateString("ru-RU")
                          : "—"}
                    </td>
                    <td>{getStatusBadge(doc.status)}</td>
                    <td>
                      <button
                        className="delete-doc-btn"
                        title="Убрать из коллекции"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRemoveTarget(doc);
                        }}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="collection-pagination">
            <span className="pagination-info">
              {pageFrom}–{pageTo} из {totalCount} документов
            </span>
            <div className="history-pagination-controls">
              <button
                className="history-page-btn history-page-arrow"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
                title="В начало"
              >
                <i className="fa fa-angle-double-left" />
              </button>
              <button
                className="history-page-btn history-page-arrow"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                title="Предыдущая"
              >
                <i className="fa fa-chevron-left" />
              </button>
              {(() => {
                const pages =
                  totalPages <= 3
                    ? Array.from({ length: totalPages }, (_, i) => i + 1)
                    : [
                        Math.min(Math.max(currentPage, 2), totalPages - 1) - 1,
                        Math.min(Math.max(currentPage, 2), totalPages - 1),
                        Math.min(Math.max(currentPage, 2), totalPages - 1) + 1,
                      ];
                return pages.map((p) => (
                  <button
                    key={p}
                    className={`history-page-btn${currentPage === p ? " active" : ""}`}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </button>
                ));
              })()}
              <button
                className="history-page-btn history-page-arrow"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                title="Следующая"
              >
                <i className="fa fa-chevron-right" />
              </button>
              <button
                className="history-page-btn history-page-arrow"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
                title="В конец"
              >
                <i className="fa fa-angle-double-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="add-doc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fa fa-plus-circle heading-icon" />
                Добавить документ
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <div className="add-doc-search-wrap">
              <i className="fa fa-search" />
              <input
                type="text"
                placeholder="Поиск по названию..."
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                autoFocus
              />
              {addSearch && (
                <button
                  className="add-doc-clear"
                  onClick={() => setAddSearch("")}
                >
                  <i className="fa fa-times" />
                </button>
              )}
            </div>

            <div className="add-doc-list">
              {loadingAll ? (
                <div className="add-doc-empty">
                  <i className="fa fa-spinner fa-spin fa-2x" />
                  <p>Загрузка документов...</p>
                </div>
              ) : filteredAddDocs.length === 0 ? (
                <div className="add-doc-empty">
                  <i className="fa fa-inbox fa-2x" />
                  <p>
                    {allDocuments.length === 0
                      ? "Все свободные документы уже добавлены в коллекции"
                      : "Ничего не найдено"}
                  </p>
                </div>
              ) : (
                <div className="add-doc-grid">
                  {filteredAddDocs.map((doc) => (
                    <div key={doc.id} className="add-doc-card">
                      <div className="add-doc-card-icon">
                        <i className={`fa ${getFileIcon(getDocType(doc))}`} />
                      </div>
                      <div className="add-doc-card-info">
                        <div className="add-doc-card-title" title={doc.title}>
                          {doc.title}
                        </div>
                        <div className="add-doc-card-meta">
                          <span className="doc-type-badge">
                            {getDocType(doc).toUpperCase()}
                          </span>
                          {getStatusBadge(doc.status)}
                        </div>
                      </div>
                      <button
                        className={`add-doc-card-btn${adding === doc.id ? " loading" : ""}`}
                        disabled={adding === doc.id}
                        onClick={() => handleAddDocument(doc)}
                      >
                        {adding === doc.id ? (
                          <>
                            <i className="fa fa-spinner fa-spin" />{" "}
                            Добавление...
                          </>
                        ) : (
                          <>
                            <i className="fa fa-plus" /> Добавить
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              {!loadingAll && (
                <span className="add-doc-footer-hint">
                  Доступно: {allDocuments.length} · Найдено:{" "}
                  {filteredAddDocs.length}
                </span>
              )}
              <button
                className="btn-cancel"
                onClick={() => setShowAddModal(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={removeTarget !== null}
        title="Убрать документ из коллекции?"
        message={`Документ «${removeTarget?.title}» будет убран из этой коллекции. Сам документ останется в системе.`}
        confirmText="Убрать"
        cancelText="Отмена"
        variant="danger"
        loading={removing}
        onConfirm={handleConfirmRemove}
        onCancel={() => setRemoveTarget(null)}
      />

      <ErrorModal
        isOpen={errorMessage !== null}
        title="Ошибка добавления"
        message={errorMessage ?? ""}
        onClose={() => setErrorMessage(null)}
      />
    </Layout>
  );
};

export default CollectionDetail;
