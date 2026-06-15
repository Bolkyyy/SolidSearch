import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { fetchDashboardData, DashboardData } from "@/api/dashboard";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { documentsApi } from "@/api/documentsApi";
import { collectionsApi, Collection } from "@/api/collectionsApi";

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

  const [reindexingId, setReindexingId] = useState<number | null>(null);
  const [activeReindexIds, setActiveReindexIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('activeReindexIds');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [collectionSizes, setCollectionSizes] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    if (activeReindexIds.size === 0) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      return;
    }
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      const ids = [...activeReindexIds];
      const results = await Promise.all(
        ids.map(id =>
          documentsApi.reindexStatus(id)
            .then(s => ({ id, active: s.active }))
            .catch(() => ({ id, active: true }))
        )
      );
      const done = results.filter(r => !r.active).map(r => r.id);
      if (done.length > 0) {
        setActiveReindexIds(prev => {
          const next = new Set(prev);
          done.forEach(id => next.delete(id));
          localStorage.setItem('activeReindexIds', JSON.stringify([...next]));
          return next;
        });
      }
    }, 5000);
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
  }, [activeReindexIds]);

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch(() => {});
    loadCollections();
    documentsApi.collectionSizes()
      .then((rows) => {
        const sizes: Record<number, number> = {};
        for (const row of rows) {
          sizes[row.collection_id] = Number(row.total_size);
        }
        setCollectionSizes(sizes);
      })
      .catch(() => {});
  }, []);

  const loadCollections = () => {
    setLoadingCols(true);
    collectionsApi.getAll()
      .then(setCollections)
      .catch(() => {})
      .finally(() => setLoadingCols(false));
  };

  const totalDocuments = data?.totalDocuments ?? 0;
  const totalIndexed = data?.totalIndexed ?? 0;
  const emptyCollections = collections.filter(c => (collectionSizes[c.id] ?? 0) === 0).length;

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
      await collectionsApi.delete(deleteTarget.id);
      setCollections((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Ошибка при удалении коллекции:", err);
    } finally {
      setDeleting(false);
    }
  };

  const setActive = (id: number, active: boolean) => {
    setActiveReindexIds(prev => {
      const next = new Set(prev);
      active ? next.add(id) : next.delete(id);
      localStorage.setItem('activeReindexIds', JSON.stringify([...next]));
      return next;
    });
  };

  const handleReindex = async (collectionId: number) => {
    setReindexingId(collectionId);
    try {
      await documentsApi.reindexCollection(collectionId);
      setActive(collectionId, true);
    } catch (err) {
      console.error("Ошибка переиндексации:", err);
    } finally {
      setReindexingId(null);
    }
  };

  const handleCancelReindex = async (collectionId: number) => {
    setCancellingId(collectionId);
    try {
      await documentsApi.cancelReindex(collectionId);
      setActive(collectionId, false);
    } catch (err) {
      console.error("Ошибка отмены:", err);
    } finally {
      setCancellingId(null);
    }
  };

  const handleCreateCollection = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const col = await collectionsApi.create(newName, newDescription);
      setCollections((prev) => [...prev, col]);
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
          <i className="fa fa-exclamation-triangle card-icon orange"></i>
          <p>Пустые коллекции</p>
          <h2>{emptyCollections}</h2>
        </div>
      </div>

      {loadingCols ? (
        <div className="page-loading-state">
          <i className="fa fa-spinner fa-spin fa-2x" />
          <p>Загрузка коллекций...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="page-empty-state">
          <i className="fa fa-folder-open fa-3x page-empty-icon" />
          <p>Коллекций пока нет. Создайте первую!</p>
        </div>
      ) : (
        <div className="archives-grid">
          {collections.map((col) => (
            <div className={`archive-item${!col.is_active ? ' archive-item--inactive' : ''}`} key={col.id}>
              <span className={`collection-status-badge collection-status-badge--card ${col.is_active ? 'collection-status-badge--active' : 'collection-status-badge--inactive'}`}>
                <i className={`fa fa-${col.is_active ? 'check-circle' : 'ban'}`} />
                {col.is_active ? 'Активна' : 'Неактивна'}
              </span>
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
                <button
                  className="btn-reindex"
                  onClick={() => handleReindex(col.id)}
                  disabled={reindexingId === col.id || activeReindexIds.has(col.id)}
                >
                  <i className={`fa ${reindexingId === col.id ? "fa-spinner fa-spin" : activeReindexIds.has(col.id) ? "fa-clock-o" : "fa-refresh"}`} />
                  {reindexingId === col.id ? " Запуск..." : activeReindexIds.has(col.id) ? " Идёт..." : " Переиндексировать"}
                </button>
                {activeReindexIds.has(col.id) && (
                  <button
                    className="btn-reindex btn-reindex--cancel"
                    onClick={() => handleCancelReindex(col.id)}
                    disabled={cancellingId === col.id}
                  >
                    <i className={`fa ${cancellingId === col.id ? "fa-spinner fa-spin" : "fa-times"}`} />
                    {cancellingId === col.id ? " Отмена..." : " Отменить"}
                  </button>
                )}
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
                <i className="fa fa-folder" />
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
