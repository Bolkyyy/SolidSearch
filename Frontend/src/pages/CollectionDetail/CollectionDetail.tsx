import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout/Layout";
import { DocumentsApi, Document } from "@/api/documentsApi";

interface Collection {
  id: number;
  name: string;
  description: string;
  code: string;
  is_active: boolean;
  source_id: number;
}

const BASE = "http://localhost:3001";

const CollectionDetail = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [addSearch, setAddSearch] = useState("");
  const [adding, setAdding] = useState<number | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);

  const id = Number(collectionId);

  useEffect(() => {
    if (!id) {
      navigate("/collections");
      return;
    }

    const load = async () => {
      try {
        const [colRes, docs] = await Promise.all([
          axios.get(`${BASE}/document_collection`),
          DocumentsApi.getByCollectionId(id),
        ]);
        const found = colRes.data.find((c: Collection) => c.id === id);
        if (!found) {
          navigate("/collections");
          return;
        }
        setCollection(found);
        setDocuments(docs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  const openAddModal = async () => {
    setShowAddModal(true);
    setLoadingAll(true);
    try {
      const all = await DocumentsApi.getAll();
      const existingIds = new Set(documents.map((d) => d.id));
      setAllDocuments(all.filter((d) => !existingIds.has(d.id)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAll(false);
    }
  };

  const handleAddDocument = async (doc: Document) => {
    setAdding(doc.id);
    try {
      const updated = await DocumentsApi.addToCollection(doc.id, id);
      setDocuments((prev) => [updated, ...prev]);
      setAllDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch {
      alert("Ошибка при добавлении документа");
    } finally {
      setAdding(null);
    }
  };
  const handleRemoveDocument = async (docId: number, docTitle: string) => {
    if (!window.confirm(`Убрать документ "${docTitle}" из коллекции?`)) return;
    try {
      await DocumentsApi.addToCollection(docId, 0);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch {
      alert("Ошибка при удалении документа");
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

  const types = Array.from(
    new Set(
      documents
        .map((d) => getDocType(d).toUpperCase())
        .filter((t) => t !== "—")
    )
  );

  const filteredDocuments = documents.filter((doc) => {
    const matchSearch = doc.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchType =
      selectedType === "all" ||
      getDocType(doc).toUpperCase() === selectedType;
    return matchSearch && matchType;
  });

  const filteredAddDocs = allDocuments.filter((doc) =>
    doc.title?.toLowerCase().includes(addSearch.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div
          style={{
            textAlign: "center",
            padding: "80px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <i className="fa fa-spinner fa-spin fa-2x" />
          <p style={{ marginTop: 16 }}>Загрузка...</p>
        </div>
      </Layout>
    );
  }

  if (!collection) return null;

  return (
    <Layout>
      <div className="collection-detail-container">

        <div className="breadcrumbs">
          <Link to="/collections">Архив документов</Link>
          <i className="fa fa-chevron-right" />
          <span>{collection.name}</span>
        </div>

        <div className="collection-header-detail">
          <div className="collection-header-content">
            <div className="collection-title-section">
              <h1>
                <i className="fa fa-folder-open" style={{ marginRight: 10 }} />
                {collection.name}
              </h1>
              <p className="collection-description">{collection.description}</p>
              <div className="collection-meta">
                <span>
                  <i className="fa fa-file-text-o" /> {documents.length}{" "}
                  документов
                </span>
                <span>
                  <i
                    className="fa fa-circle"
                    style={{
                      color: collection.is_active ? "#10b981" : "#ef4444",
                      marginRight: 4,
                    }}
                  />
                  {collection.is_active ? "Активна" : "Неактивна"}
                </span>
              </div>
            </div>
            <div className="collection-actions-detail">
              <button className="btn-upload" onClick={openAddModal}>
                <i className="fa fa-plus" /> Добавить документ
              </button>
              <button
                className="btn-reindex-detail"
                onClick={() => alert("Переиндексация запущена")}
              >
                <i className="fa fa-refresh" /> Переиндексировать
              </button>
            </div>
          </div>
        </div>

        <div className="stats-mini-grid">
          <div className="stat-mini-card total">
            <div className="stat-mini-value">{documents.length}</div>
            <div className="stat-mini-label">Всего документов</div>
          </div>
          <div className="stat-mini-card indexed">
            <div className="stat-mini-value">
              {documents.filter((d) => d.status === "processed").length}
            </div>
            <div className="stat-mini-label">Проиндексировано</div>
          </div>
          <div className="stat-mini-card processing">
            <div className="stat-mini-value">
              {
                documents.filter(
                  (d) =>
                    d.status === "processing" || d.status === "pending"
                ).length
              }
            </div>
            <div className="stat-mini-label">В обработке</div>
          </div>
          <div className="stat-mini-card errors">
            <div className="stat-mini-value">
              {
                documents.filter((d) => d.status === "extraction_failed")
                  .length
              }
            </div>
            <div className="stat-mini-label">Ошибки</div>
          </div>
        </div>

        <div className="documents-controls">
          <div className="search-box">
            <i className="fa fa-search" />
            <input
              type="text"
              placeholder="Поиск по документам..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-buttons-group">
            <button
              className={`filter-btn ${
                selectedType === "all" ? "active" : ""
              }`}
              onClick={() => setSelectedType("all")}
            >
              Все
            </button>
            {types.map((type) => (
              <button
                key={type}
                className={`filter-btn ${
                  selectedType === type ? "active" : ""
                }`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="documents-table-wrapper">
          <table className="documents-table">
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
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <i className="fa fa-inbox" />
                    <p>Документы не найдены</p>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => navigate(`/document/${doc.id}`)}
                    style={{ cursor: "pointer" }}
                    title="Открыть документ"
                  >
                    <td>
                      <div className="doc-name-cell">
                        <i
                          className={`fa ${getFileIcon(getDocType(doc))}`}
                        />
                        <span>{doc.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="doc-type-badge">
                        {getDocType(doc).toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {doc.files?.length ?? 0}
                    </td>
                    <td>{getTotalSize(doc.files)}</td>
                    <td>
                      {doc.document_date
                        ? new Date(doc.document_date).toLocaleDateString(
                            "ru-RU"
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
                          handleRemoveDocument(doc.id, doc.title);
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
      </div>

      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="modal-container-upload"
            style={{
              maxWidth: 720,
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <i className="fa fa-database" style={{ marginRight: 10 }} />
                Добавить документ из базы
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <i className="fa fa-times" />
              </button>
            </div>

            <div
              style={{
                padding: "12px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="search-box" style={{ maxWidth: "100%" }}>
                <i className="fa fa-search" />
                <input
                  type="text"
                  placeholder="Поиск по названию..."
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {loadingAll ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <i className="fa fa-spinner fa-spin fa-2x" />
                  <p style={{ marginTop: 12 }}>Загрузка документов...</p>
                </div>
              ) : filteredAddDocs.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <i className="fa fa-inbox fa-2x" />
                  <p style={{ marginTop: 12 }}>
                    {allDocuments.length === 0
                      ? "Все документы уже в этой коллекции"
                      : "Ничего не найдено"}
                  </p>
                </div>
              ) : (
                <table className="documents-table">
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Тип</th>
                      <th>Файлов</th>
                      <th>Размер</th>
                      <th>Статус</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAddDocs.map((doc) => (
                      <tr key={doc.id} style={{ cursor: "default" }}>
                        <td>
                          <div className="doc-name-cell">
                            <i
                              className={`fa ${getFileIcon(getDocType(doc))}`}
                            />
                            <span>{doc.title}</span>
                          </div>
                        </td>
                        <td>
                          <span className="doc-type-badge">
                            {getDocType(doc).toUpperCase()}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {doc.files?.length ?? 0}
                        </td>
                        <td>{getTotalSize(doc.files)}</td>
                        <td>{getStatusBadge(doc.status)}</td>
                        <td>
                          <button
                            className="btn-upload-submit"
                            style={{ padding: "6px 14px", fontSize: 13 }}
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-footer">
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
    </Layout>
  );
};

export default CollectionDetail;