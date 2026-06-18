import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { documentsApi, Document, CollectionStats } from "@/api/documentsApi";

const PAGE_SIZE = 10;

type SortField = "title" | "type" | "date" | "status";
type SortDir = "asc" | "desc";

const CollectionPage = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [docsLoading, setDocsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const appliedSearchRef = useRef("");
  const appliedTypeRef = useRef("all");
  const appliedDateRef = useRef("");
  const sortFieldRef = useRef<SortField>("date");
  const sortDirRef = useRef<SortDir>("desc");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const formatRef = useRef<HTMLDivElement>(null);
  const currentPageRef = useRef(1);
  const [formatOpen, setFormatOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchDocs = async (page: number, silent = false) => {
    currentPageRef.current = page;
    if (!silent) setDocsLoading(true);
    try {
      const result = await documentsApi.getAllPaginated(
        page,
        PAGE_SIZE,
        appliedSearchRef.current,
        sortFieldRef.current,
        sortDirRef.current,
        appliedTypeRef.current,
        appliedDateRef.current,
      );
      setDocuments(result.data);
      setTotalCount(result.total);
    } catch (e) {
      console.error("Ошибка загрузки документов", e);
    } finally {
      if (!silent) setDocsLoading(false);
    }
  };

  const fetchStats = () => {
    documentsApi.getAllStats().then(setStats).catch(() => {});
  };

  useEffect(() => {
    fetchDocs(1);
    fetchStats();
    const interval = setInterval(() => {
      fetchDocs(currentPageRef.current, true);
      fetchStats();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!formatOpen) return;
    const handler = (e: MouseEvent) => {
      if (formatRef.current && !formatRef.current.contains(e.target as Node)) {
        setFormatOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [formatOpen]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      appliedSearchRef.current = value;
      setCurrentPage(1);
      fetchDocs(1);
    }, 300);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    appliedTypeRef.current = type;
    setFormatOpen(false);
    setCurrentPage(1);
    fetchDocs(1);
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    appliedDateRef.current = value;
    setCurrentPage(1);
    fetchDocs(1);
  };

  const handleSort = (field: SortField) => {
    let dir: SortDir;
    if (sortFieldRef.current === field) {
      dir = sortDirRef.current === "asc" ? "desc" : "asc";
    } else {
      dir = "asc";
    }
    sortFieldRef.current = field;
    sortDirRef.current = dir;
    setSortField(field);
    setSortDir(dir);
    setCurrentPage(1);
    fetchDocs(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchDocs(page);
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await documentsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      const nextPage =
        documents.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      if (nextPage !== currentPage) setCurrentPage(nextPage);
      await fetchDocs(nextPage);
      fetchStats();
    } catch {
      console.error("Ошибка при удалении документа");
    } finally {
      setDeleting(false);
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

  const getFormatClass = (type: string) => {
    const map: Record<string, string> = {
      PDF: "fmt-pdf",
      DOC: "fmt-word",
      DOCX: "fmt-word",
      RTF: "fmt-word",
      TXT: "fmt-text",
      MD: "fmt-text",
      XLS: "fmt-excel",
      XLSX: "fmt-excel",
      ODS: "fmt-excel",
      CSV: "fmt-excel",
      PPT: "fmt-ppt",
      PPTX: "fmt-ppt",
      PNG: "fmt-image",
      JPG: "fmt-image",
      JPEG: "fmt-image",
      TIFF: "fmt-image",
      WEBP: "fmt-image",
    };
    return map[type?.toUpperCase()] || "fmt-other";
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

  const pageFrom = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageTo = Math.min(currentPage * PAGE_SIZE, totalCount);

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return <i className="fa fa-sort sort-icon" />;
    return (
      <i className={`fa fa-sort-${sortDir === "asc" ? "asc" : "desc"} sort-icon sort-icon--active`} />
    );
  };

  return (
    <Layout>
      <section className="welcome">
        <div>
          <h1>Архив документов</h1>
          <p className="welcome-link">Все загруженные документы</p>
        </div>
      </section>

      <div className="stats-cards">
        <div className="stat-card-archive">
          <i className="fa fa-file-text card-icon green"></i>
          <p>Всего документов</p>
          <h2>{stats?.total ?? 0}</h2>
        </div>
        <div className="stat-card-archive">
          <i className="fa fa-bolt card-icon purple"></i>
          <p>Проиндексировано</p>
          <h2>{stats?.processed ?? 0}</h2>
        </div>
        <div className="stat-card-archive">
          <i className="fa fa-spinner card-icon blue"></i>
          <p>В обработке</p>
          <h2>{stats?.processing ?? 0}</h2>
        </div>
        <div className="stat-card-archive">
          <i className="fa fa-exclamation-triangle card-icon orange"></i>
          <p>Ошибки</p>
          <h2>{stats?.failed ?? 0}</h2>
        </div>
      </div>

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
        <div className="table-filters">
        <div className={`date-filter${selectedDate ? " date-filter--active" : ""}`}>
          <i className="fa fa-calendar date-filter-icon" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            title="Фильтр по дате документа"
          />
          {selectedDate && (
            <button
              type="button"
              className="date-filter-clear"
              onClick={() => handleDateChange("")}
              title="Сбросить дату"
            >
              <i className="fa fa-times" />
            </button>
          )}
        </div>

        <div className="fmt-filter" ref={formatRef}>
          <button
            type="button"
            className={`fmt-filter-btn${selectedType !== "all" ? " fmt-filter-btn--active" : ""}`}
            onClick={() => setFormatOpen((v) => !v)}
            title="Фильтр по формату"
          >
            <i className="fa fa-filter fmt-filter-icon" />
            {selectedType === "all" ? (
              <span className="fmt-filter-label">Все форматы</span>
            ) : (
              <span className={`doc-type-badge ${getFormatClass(selectedType)}`}>
                {selectedType.toUpperCase()}
              </span>
            )}
            <i
              className={`fa fa-chevron-${formatOpen ? "up" : "down"} fmt-filter-caret`}
            />
          </button>
          {formatOpen && (
            <div className="fmt-filter-panel">
              <button
                type="button"
                className={`fmt-filter-item${selectedType === "all" ? " active" : ""}`}
                onClick={() => handleTypeChange("all")}
              >
                <span className="fmt-filter-all">Все форматы</span>
                {selectedType === "all" && <i className="fa fa-check" />}
              </button>
              {(stats?.types ?? []).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`fmt-filter-item${selectedType === type ? " active" : ""}`}
                  onClick={() => handleTypeChange(type)}
                >
                  <span className={`doc-type-badge ${getFormatClass(type)}`}>
                    {type.toUpperCase()}
                  </span>
                  {selectedType === type && <i className="fa fa-check" />}
                </button>
              ))}
            </div>
          )}
        </div>
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
              <th className="th-sortable" onClick={() => handleSort("title")}>
                Название {sortIcon("title")}
              </th>
              <th className="th-sortable" onClick={() => handleSort("type")}>
                Формат {sortIcon("type")}
              </th>
              <th>Файлов</th>
              <th>Размер</th>
              <th className="th-sortable" onClick={() => handleSort("date")}>
                Дата документа {sortIcon("date")}
              </th>
              <th className="th-sortable" onClick={() => handleSort("status")}>
                Статус {sortIcon("status")}
              </th>
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
                    <span
                      className={`doc-type-badge ${getFormatClass(getDocType(doc))}`}
                    >
                      {getDocType(doc).toUpperCase()}
                    </span>
                  </td>
                  <td className="td-center">{doc.files?.length ?? 0}</td>
                  <td>{getTotalSize(doc.files)}</td>
                  <td>
                    {doc.document_date
                      ? new Date(doc.document_date).toLocaleDateString("ru-RU")
                      : doc.created_at
                        ? new Date(doc.created_at).toLocaleDateString("ru-RU")
                        : "—"}
                  </td>
                  <td>{getStatusBadge(doc.status)}</td>
                  <td>
                    <button
                      className="delete-doc-btn"
                      title="Удалить документ"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(doc);
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

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Удалить документ?"
        message={`Документ «${deleteTarget?.title}» будет удалён безвозвратно вместе с файлами. Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  );
};

export default CollectionPage;
