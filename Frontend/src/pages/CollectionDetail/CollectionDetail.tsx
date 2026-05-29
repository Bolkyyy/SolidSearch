// Frontend/src/pages/CollectionDetail/CollectionDetail.tsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  dateAdded: string;
  status: "indexed" | "processing" | "error";
}

const CollectionDetail = () => {
  const { collectionName } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Данные коллекции
  const collectionData: { [key: string]: any } = {
    "Архив 2024": {
      name: "Архив 2024",
      description: "Документы за 2024 год",
      totalDocs: 3245,
      size: "2.4 ГБ",
      formats: ["PDF", "DOCX", "TXT"],
      createdAt: "2024-01-01",
    },
    "Архив 2023": {
      name: "Архив 2023",
      description: "Документы за 2023 год",
      totalDocs: 8134,
      size: "5.8 ГБ",
      formats: ["PDF", "DOCX", "TXT"],
      createdAt: "2023-01-01",
    },
    "Текущие проекты": {
      name: "Текущие проекты",
      description: "Активные проекты компании",
      totalDocs: 456,
      size: "890 МБ",
      formats: ["PDF", "DOCX", "TXT", "XLSX"],
      createdAt: "2025-01-01",
    },
  };

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Годовой отчет 2024.pdf",
      type: "PDF",
      size: "2.3 МБ",
      dateAdded: "2024-12-15",
      status: "indexed",
    },
    {
      id: "2",
      name: "Техническая документация.docx",
      type: "DOCX",
      size: "1.1 МБ",
      dateAdded: "2024-12-10",
      status: "indexed",
    },
    {
      id: "3",
      name: "Заметки встречи.txt",
      type: "TXT",
      size: "45 КБ",
      dateAdded: "2024-12-05",
      status: "processing",
    },
    {
      id: "4",
      name: "Презентация проекта.pptx",
      type: "PPTX",
      size: "5.7 МБ",
      dateAdded: "2024-11-28",
      status: "indexed",
    },
    {
      id: "5",
      name: "Финансовая модель.xlsx",
      type: "XLSX",
      size: "890 КБ",
      dateAdded: "2024-11-20",
      status: "error",
    },
    {
      id: "6",
      name: "Договор поставки.pdf",
      type: "PDF",
      size: "1.2 МБ",
      dateAdded: "2024-11-15",
      status: "indexed",
    },
    {
      id: "7",
      name: "Инструкция пользователя.docx",
      type: "DOCX",
      size: "3.4 МБ",
      dateAdded: "2024-11-10",
      status: "indexed",
    },
    {
      id: "8",
      name: "Логи сервера.txt",
      type: "TXT",
      size: "128 КБ",
      dateAdded: "2024-11-05",
      status: "indexed",
    },
  ]);

  const collection = collectionData[collectionName as string];

  useEffect(() => {
    if (!collection) {
      navigate("/collections");
    }
  }, [collection, navigate]);

  if (!collection) {
    return null;
  }

  const handleReindex = () => {
    alert(
      `Переиндексация коллекции "${collection.name}" запущена. Это может занять несколько минут.`,
    );
  };

  const handleDeleteDocument = (id: string, name: string) => {
    if (window.confirm(`Удалить документ "${name}"?`)) {
      setDocuments(documents.filter((doc) => doc.id !== id));
    }
  };

  const handleFileUpload = () => {
    if (selectedFiles.length === 0) {
      alert("Выберите файлы для загрузки");
      return;
    }

    const newDocuments: Document[] = selectedFiles.map((file, index) => ({
      id: Date.now().toString() + index,
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() || "FILE",
      size: (file.size / 1024 / 1024).toFixed(2) + " МБ",
      dateAdded: new Date().toISOString().split("T")[0],
      status: "processing",
    }));

    setDocuments([...newDocuments, ...documents]);
    setSelectedFiles([]);
    setShowUploadModal(false);
    alert(`Загружено ${selectedFiles.length} файлов. Начинается обработка...`);
  };

  const getFileIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      PDF: "fa-file-pdf-o",
      DOCX: "fa-file-word-o",
      TXT: "fa-file-text-o",
      XLSX: "fa-file-excel-o",
      PPTX: "fa-file-powerpoint-o",
    };
    return icons[type] || "fa-file-o";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "indexed":
        return (
          <span className="status-success">
            <i className="fa fa-check-circle"></i> Индексирован
          </span>
        );
      case "processing":
        return (
          <span className="status-warning">
            <i className="fa fa-spinner fa-spin"></i> Обработка
          </span>
        );
      case "error":
        return (
          <span className="status-error">
            <i className="fa fa-exclamation-circle"></i> Ошибка
          </span>
        );
      default:
        return null;
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <Layout>
      <div className="collection-detail-container">
        {/* Хлебные крошки */}
        <div className="breadcrumbs">
          <Link to="/collections">Архив документов</Link>
          <i className="fa fa-chevron-right"></i>
          <span>{collection.name}</span>
        </div>

        {/* Заголовок коллекции */}
        <div className="collection-header-detail">
          <div className="collection-header-content">
            <div className="collection-title-section">
              <h1>
                <i className="fa fa-folder-open"></i>
                {collection.name}
              </h1>
              <p className="collection-description">{collection.description}</p>
              <div className="collection-meta">
                <span>
                  <i className="fa fa-calendar"></i> Создана:{" "}
                  {collection.createdAt}
                </span>
                <span>
                  <i className="fa fa-database"></i> {collection.size}
                </span>
                <span>
                  <i className="fa fa-file-text-o"></i> {collection.totalDocs}{" "}
                  документов
                </span>
              </div>
            </div>
            <div className="collection-actions-detail">
              <button
                className="btn-upload"
                onClick={() => setShowUploadModal(true)}
              >
                <i className="fa fa-upload"></i> Загрузить
              </button>
              <button className="btn-reindex-detail" onClick={handleReindex}>
                <i className="fa fa-refresh"></i> Переиндексировать
              </button>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="stats-mini-grid">
          <div className="stat-mini-card total">
            <div className="stat-mini-value">{documents.length}</div>
            <div className="stat-mini-label">Всего документов</div>
          </div>
          <div className="stat-mini-card indexed">
            <div className="stat-mini-value">
              {documents.filter((d) => d.status === "indexed").length}
            </div>
            <div className="stat-mini-label">Проиндексировано</div>
          </div>
          <div className="stat-mini-card processing">
            <div className="stat-mini-value">
              {documents.filter((d) => d.status === "processing").length}
            </div>
            <div className="stat-mini-label">В обработке</div>
          </div>
          <div className="stat-mini-card errors">
            <div className="stat-mini-value">
              {documents.filter((d) => d.status === "error").length}
            </div>
            <div className="stat-mini-label">Ошибки</div>
          </div>
        </div>

        {/* Поиск и фильтры */}
        <div className="documents-controls">
          <div className="search-box">
            <i className="fa fa-search"></i>
            <input
              type="text"
              placeholder="Поиск по документам..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-buttons-group">
            <button
              className={`filter-btn ${selectedType === "all" ? "active" : ""}`}
              onClick={() => setSelectedType("all")}
            >
              Все
            </button>
            {collection.formats.map((format: string) => (
              <button
                key={format}
                className={`filter-btn ${selectedType === format ? "active" : ""}`}
                onClick={() => setSelectedType(format)}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        {/* Таблица документов */}
        <div className="documents-table-wrapper">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Тип</th>
                <th>Размер</th>
                <th>Дата добавления</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    <i className="fa fa-inbox"></i>
                    <p>Документы не найдены</p>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="doc-name-cell">
                        <i className={`fa ${getFileIcon(doc.type)}`}></i>
                        <span>{doc.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="doc-type-badge">{doc.type}</span>
                    </td>
                    <td>{doc.size}</td>
                    <td>{doc.dateAdded}</td>
                    <td>{getStatusBadge(doc.status)}</td>
                    <td>
                      <button
                        className="delete-doc-btn"
                        onClick={() => handleDeleteDocument(doc.id, doc.name)}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно загрузки */}
      {showUploadModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="modal-container-upload"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Загрузка документов</h2>
              <button
                className="modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div
                className="upload-area"
                onDrop={(e) => {
                  e.preventDefault();
                  setSelectedFiles(Array.from(e.dataTransfer.files));
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <i className="fa fa-cloud-upload fa-3x"></i>
                <p>Перетащите файлы сюда или</p>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setSelectedFiles(Array.from(e.target.files || []))
                  }
                  className="hidden-input"
                  id="fileInput"
                />
                <button
                  className="btn-secondary"
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  Выбрать файлы
                </button>
                {selectedFiles.length > 0 && (
                  <div className="selected-files">
                    <p>Выбрано файлов: {selectedFiles.length}</p>
                    <ul>
                      {selectedFiles.slice(0, 5).map((file, i) => (
                        <li key={i}>
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                          МБ)
                        </li>
                      ))}
                      {selectedFiles.length > 5 && (
                        <li>...и ещё {selectedFiles.length - 5}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowUploadModal(false)}
              >
                Отмена
              </button>
              <button className="btn-upload-submit" onClick={handleFileUpload}>
                <i className="fa fa-upload"></i> Загрузить{" "}
                {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CollectionDetail;
