import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout/Layout";
import { fetchDashboardData, DashboardData } from "@/api/dashboard";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { DocumentsApi } from "@/api/documentsApi";

interface Collection {
  id: number;
  name: string;
  description: string;
  code: string;
  is_active: boolean;
  source_id: number;
}

const BASE = "http://localhost:3001";

const CollectionPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCols, setLoadingCols] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [collectionSizes, setCollectionSizes] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch(() => {});
    loadCollections();
    DocumentsApi.getAll()
      .then((docs) => {
        const sizes: Record<number, number> = {};
        for (const doc of docs) {
          if (!doc.collection_id) continue;
          const docSize = (doc.files ?? []).reduce(
            (s, f) => s + (f.file_size ?? 0),
            0,
          );
          sizes[doc.collection_id] = (sizes[doc.collection_id] ?? 0) + docSize;
        }
        setCollectionSizes(sizes);
      })
      .catch(() => {});
  }, []);

  const loadCollections = () => {
    setLoadingCols(true);
    axios
      .get(`${BASE}/document_collection`)
      .then((res) => setCollections(res.data))
      .catch(() => {})
      .finally(() => setLoadingCols(false));
  };

  const totalDocuments = data?.totalDocuments ?? 0;
  const totalIndexed = data?.totalIndexed ?? 0;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 МБ";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / 1024 / 1024).toFixed(2)} МБ`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} ГБ`;
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${BASE}/document_collection/${deleteTarget.id}`);
      setCollections((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Ошибка при удалении коллекции:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const baseCode = newName
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      const code = (baseCode || "collection") + "_" + Date.now();
      const res = await axios.post(`${BASE}/document_collection`, {
        name: newName,
        description: newDescription,
        code,
        is_active: true,
        source_id: 1,
      });
      setCollections((prev) => [...prev, res.data]);
      setNewName("");
      setNewDescription("");
      setShowModal(false);
    } catch (err) {
      console.error("Ошибка при создании коллекции:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout>
      <section className="welcome flex-row">
        <div>
          <h1>Архив документов</h1>
          <p className="welcome-link">
            Управление коллекциями и архивами документов
          </p>
        </div>
        <button
          className="create-collection-btn"
          onClick={() => setShowModal(true)}
        >
          <i className="fa fa-plus"></i> Создать коллекцию
        </button>
      </section>

      <div className="stats-cards">
        <div className="stat-card-archive">
          <i className="fa fa-folder card-icon blue"></i>
          <p>Всего коллекций</p>
          <h2>{collections.length}</h2>
        </div>
        <div className="stat-card-archive">
          <i className="fa fa-file-text card-icon green"></i>
          <p>Всего документов</p>
          <h2>{totalDocuments}</h2>
        </div>
        <div className="stat-card-archive">
          <i className="fa fa-bolt card-icon purple"></i>
          <p>Проиндексировано</p>
          <h2>{totalIndexed}</h2>
        </div>
        <div className="stat-card-archive">
          <i className="fa fa-history card-icon orange"></i>
          <p>Требуют внимания</p>
          <h2>1</h2>
        </div>
      </div>

      {loadingCols ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <i className="fa fa-spinner fa-spin fa-2x" />
          <p style={{ marginTop: 12 }}>Загрузка коллекций...</p>
        </div>
      ) : collections.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <i
            className="fa fa-folder-open fa-3x"
            style={{ marginBottom: 16, display: "block" }}
          />
          <p>Коллекций пока нет. Создайте первую!</p>
        </div>
      ) : (
        <div className="archives-grid">
          {collections.map((col) => (
            <div className="archive-item" key={col.id}>
              <div className="archive-item-header">
                <i className="fa fa-folder-open collection-folder-icon" />
                <h3 className="inline-block">{col.name}</h3>
              </div>
              <div className="archive-info">
                <span>{col.description || "Нет описания"}</span>
                <span className="collection-size">
                  <i className="fa fa-database" />
                  {formatSize(collectionSizes[col.id] ?? 0)}
                </span>
              </div>
              <div className="archive-buttons">
                <Link to={`/collection/${col.id}`} className="btn-open">
                  <i className="fa fa-folder-open"></i> Открыть
                </Link>
                <Link to="/indexing" className="btn-reindex">
                  <i className="fa fa-refresh"></i> Переиндексировать
                </Link>
                <button
                  className="btn-delete-collection"
                  onClick={() => setDeleteTarget(col)}
                  title="Удалить коллекцию"
                >
                  <i className="fa fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fa fa-folder-o" />
                Новая коллекция
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Название *</label>
                <input
                  type="text"
                  placeholder="Например: Договоры 2024"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleCreateCollection()
                  }
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <input
                  type="text"
                  placeholder="Краткое описание (необязательно)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Отмена
              </button>
              <button
                className="btn-create"
                onClick={handleCreateCollection}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <i className="fa fa-spinner fa-spin" /> Создание...
                  </>
                ) : (
                  "Создать"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Удалить коллекцию?"
        message={`Коллекция «${deleteTarget?.name}» будет удалена безвозвратно. Это действие нельзя отменить.`}
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
