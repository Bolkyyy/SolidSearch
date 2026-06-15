import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import ErrorToast from "../../components/ErrorToast/ErrorToast";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { HistoryItem, historyApi } from "@/api/historyApi";
import { session } from "@/utils/session";

type FilterMap = {
  period?: string;
  source?: string;
  format?: string;
  formats?: string;
  collection?: string;
};

const FILTER_META: Record<string, { label: string; icon: string; cls: string }> = {
  period:     { label: "Период",     icon: "fa-calendar-alt", cls: "filter-badge-period" },
  source:     { label: "Источник",   icon: "fa-database",     cls: "filter-badge-source" },
  format:     { label: "Формат",     icon: "fa-file-alt",     cls: "filter-badge-format" },
  formats:    { label: "Форматы",    icon: "fa-file-alt",     cls: "filter-badge-format" },
  collection: { label: "Коллекция", icon: "fa-folder",       cls: "filter-badge-collection" },
};

const FiltersBadges = ({ filters }: { filters?: FilterMap | null }) => {
  if (!filters) return <span className="history-no-filters">Без фильтров</span>;

  const active = Object.entries(filters).filter(
    ([, v]) => v && v !== "all",
  ) as [string, string][];

  if (active.length === 0) return <span className="history-no-filters">Без фильтров</span>;

  return (
    <div className="filter-badges-wrap">
      {active.map(([key, val]) => {
        if (key === "formats") {
          const all = val.split(",").map((f) => f.trim()).filter(Boolean);
          const shown = all.slice(0, 2);
          const rest = all.slice(2);
          return (
            <span key={key} className="filter-formats-group">
              {shown.map((fmt) => (
                <span key={fmt} className="filter-badge filter-badge-format">
                  <i className="fas fa-file-alt filter-badge-icon" />
                  <span className="filter-badge-val">{fmt}</span>
                </span>
              ))}
              {rest.length > 0 && (
                <span className="filter-more-wrap">
                  <span className="filter-more-circle">+{rest.length}</span>
                  <span className="filter-more-tooltip">
                    <span className="filter-more-title">Ещё форматы</span>
                    {rest.map((fmt) => (
                      <span key={fmt} className="filter-more-fmt">{fmt}</span>
                    ))}
                  </span>
                </span>
              )}
            </span>
          );
        }

        const meta = FILTER_META[key] ?? { label: key, icon: "fa-tag", cls: "filter-badge-default" };
        return (
          <span key={key} className={`filter-badge ${meta.cls}`}>
            <i className={`fas ${meta.icon} filter-badge-icon`} />
            <span className="filter-badge-label">{meta.label}</span>
            <span className="filter-badge-sep">·</span>
            <span className="filter-badge-val">{val}</span>
          </span>
        );
      })}
    </div>
  );
};

const PAGE_SIZE = 7;

const StatusBadge = ({ status }: { status?: string | null }) => {
  if (status === "success")
    return <span className="history-badge success">Успешно</span>;
  if (status === "not_found")
    return <span className="history-badge pending">Не найдено</span>;
  if (status === "error")
    return <span className="history-badge error">Ошибка</span>;
  return <span className="history-badge success">Успешно</span>;
};

type ConfirmState = { type: "clear" } | { type: "delete"; id: number } | null;

const HistoryPage = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = session.getUserId();
    if (!userId) return;
    historyApi
      .getByUserId(Number(userId))
      .then((data) => setHistory(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter((item) => item.query_text?.toLowerCase().includes(q));
  }, [history, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const pageNumbers = useMemo(() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const mid = Math.min(Math.max(currentPage, 2), totalPages - 1);
    return [mid - 1, mid, mid + 1];
  }, [totalPages, currentPage]);

  const formatDate = (iso: string) => {
    const raw = iso.trim().replace(" ", "T").replace(/(\.\d{3})\d+/, "$1");
    const normalized = /[Zz]$|[+-]\d{2}:?\d{2}$/.test(raw) ? raw : raw + "Z";
    const d = new Date(new Date(normalized).getTime() + 6 * 60 * 60 * 1000);
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  const repeatSearch = (item: HistoryItem) => {
    const userId = session.getUserId();
    if (!userId) {
      setError("Пользователь не авторизован");
      return;
    }
    if (!item.query_text?.trim()) return;
    navigate("/search/results", {
      state: {
        query: item.query_text,
        userId: Number(userId),
        filters: item.filters_json ?? {},
      },
    });
  };

  const handleConfirm = async () => {
    if (!confirm) return;

    if (confirm.type === "clear") {
      const userId = session.getUserId();
      if (!userId) return;
      setClearing(true);
      try {
        await historyApi.clearHistory(Number(userId));
        sessionStorage.removeItem("solidSearch_cache");
        setHistory([]);
        setSearchQuery("");
        setCurrentPage(1);
      } catch (err: unknown) {
        console.error("[clearHistory error]", err);
        setError("Не удалось очистить историю.");
      } finally {
        setClearing(false);
        setConfirm(null);
      }
    }

    if (confirm.type === "delete") {
      try {
        await historyApi.deleteItem(confirm.id);
        setHistory((prev) => prev.filter((item) => item.id !== confirm.id));
      } catch (err) {
        console.error("[deleteItem error]", err);
        setError("Не удалось удалить запись.");
      } finally {
        setConfirm(null);
      }
    }
  };

  return (
    <Layout>
      {error && <ErrorToast message={error} onClose={() => setError("")} />}

      <section className="welcome">
        <h1>История запросов</h1>
        <p className="welcome-link">Обзор активности и статистика системы</p>
      </section>

      <div className="history-filters">
        <button
          className="history-filter-btn history-clear-btn"
          disabled={clearing || history.length === 0}
          onClick={() => setConfirm({ type: "clear" })}
        >
          {clearing ? (
            <>
              <i className="fa fa-spinner fa-spin" /> Очистка...
            </>
          ) : (
            <>
              <i className="fa fa-trash" /> Очистить историю
            </>
          )}
        </button>

        <div className="history-search">
          <i className="fa fa-search" />
          <input
            type="text"
            placeholder="Поиск по запросам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <i
              className="fa fa-times history-search-clear"
              onClick={() => setSearchQuery("")}
            />
          )}
        </div>
      </div>

      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Запрос</th>
              <th>Дата и время</th>
              <th>Фильтры</th>
              <th>Результаты</th>
              <th>Статус</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="history-empty-cell">
                  {searchQuery
                    ? `По запросу «${searchQuery}» ничего не найдено`
                    : "История пуста"}
                </td>
              </tr>
            )}
            {paginated.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="history-query-text">{item.query_text}</div>
                </td>
                <td>
                  <span className="history-date">
                    {formatDate(item.created_at)}
                  </span>
                </td>
                <td>
                  <FiltersBadges filters={item.filters_json} />
                </td>
                <td>
                  <span className="history-results">
                    {item.result_count != null ? item.result_count : "—"}
                  </span>
                </td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>
                  <div className="history-actions-cell">
                    <button
                      className="history-action-btn"
                      onClick={() => repeatSearch(item)}
                    >
                      <i className="fa fa-repeat" /> Повторить
                    </button>
                    <button
                      className="history-action-btn history-delete-btn"
                      onClick={() =>
                        setConfirm({ type: "delete", id: item.id })
                      }
                      title="Удалить запись"
                    >
                      <i className="fa fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="history-pagination">
          <span className="history-pagination-info">
            {filtered.length === 0
              ? "Нет записей"
              : `Показано ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                  currentPage * PAGE_SIZE,
                  filtered.length,
                )} из ${filtered.length}`}
          </span>
          <div className="history-pagination-controls">
            <button
              className="history-page-btn history-page-arrow"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              title="В начало"
            >
              <i className="fa fa-angle-double-left" />
            </button>
            <button
              className="history-page-btn history-page-arrow"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              title="Предыдущая"
            >
              <i className="fa fa-chevron-left" />
            </button>

            {pageNumbers.map((p) => (
              <button
                key={p}
                className={`history-page-btn${currentPage === p ? " active" : ""}`}
                onClick={() => setCurrentPage(p as number)}
              >
                {p}
              </button>
            ))}

            <button
              className="history-page-btn history-page-arrow"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              title="Следующая"
            >
              <i className="fa fa-chevron-right" />
            </button>
            <button
              className="history-page-btn history-page-arrow"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              title="В конец"
            >
              <i className="fa fa-angle-double-right" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirm !== null}
        title={
          confirm?.type === "clear" ? "Очистить историю?" : "Удалить запись?"
        }
        message={
          confirm?.type === "clear"
            ? "Все запросы будут удалены безвозвратно. Это действие нельзя отменить."
            : "Эта запись будет удалена из истории навсегда."
        }
        confirmText={confirm?.type === "clear" ? "Очистить всё" : "Удалить"}
        cancelText="Отмена"
        variant="danger"
        loading={clearing}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </Layout>
  );
};

export default HistoryPage;
