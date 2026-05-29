import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout/Layout";
import { fetchDashboardData, DashboardData } from "@/api/dashboard";

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

  useEffect(() => {
    fetchDashboardData().then(setData).catch(() => {});
    loadCollections();
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

  const handleCreateCollection = async () => {
    if (!newName.trim()) {
      alert("Введите название коллекции");
      return;
    }
    setCreating(true);
    try {
      const res = await axios.post(`${BASE}/document_collection`, {
        name: newName,
        description: newDescription,
        code: newName
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, ""),
        is_active: true,
        source_id: 1,
      });
      setCollections((prev) => [...prev, res.data]);
      setNewName("");
      setNewDescription("");
      setShowModal(false);
    } catch {
      alert("Ошибка при создании коллекции");
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

      {/* Статистика */}
      <div className="stats-cards">
        <div className="stat-card-archive">
          <i className="fa fa-folder card-icon blue"></i>
          <p>Всего коллекций</p>
          <h2>{collections.length}</h2>
          <span className="trend-up">актуально</span>
        </div>
        <div className="stat-card-archive">
          <i className="fa fa-file-text card-icon green"></i>
          <p>Всего документов</p>
          <h2>{totalDocuments}</h2>
          <span className="trend-up-index">+{totalDocuments}</span>
        </div>
        <div className="stat-card-archive">
          <i className="fa fa-bolt card-icon purple"></i>
          <p>Проиндексировано</p>
          <h2>{totalIndexed}</h2>
          <span className="trend-up-request">+{totalIndexed}</span>
        </div>
        <div className="stat-card-archive">
          <i className="fa fa-history card-icon orange"></i>
          <p>Требуют внимания</p>
          <h2>1</h2>
          <span className="trend-down">-</span>
        </div>
      </div>

      {/* Сетка коллекций */}
      {loadingCols ? (
        <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.5)" }}>
          <i className="fa fa-spinner fa-spin fa-2x" />
          <p style={{ marginTop: 12 }}>Загрузка коллекций...</p>
        </div>
      ) : collections.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.4)" }}>
          <i className="fa fa-folder-open fa-3x" style={{ marginBottom: 16, display: "block" }} />
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
                <span>
                  <i
                    className="fa fa-circle"
                    style={{
                      color: col.is_active ? "#10b981" : "#ef4444",
                      marginRight: 4,
                    }}
                  />
                  {col.is_active ? "Активна" : "Неактивна"}
                </span>
              </div>
              <div className="archive-buttons">
                <Link to={`/collection/${col.id}`} className="btn-open">
                  <i className="fa fa-folder-open"></i> Открыть
                </Link>
                <Link to="/indexing" className="btn-reindex">
                  <i className="fa fa-refresh"></i> Переиндексировать
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модал создания коллекции */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Создание коллекции</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Название коллекции *</label>
                <input
                  type="text"
                  placeholder="Введите название"
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
                  placeholder="Краткое описание коллекции"
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
    </Layout>
  );
};

export default CollectionPage;