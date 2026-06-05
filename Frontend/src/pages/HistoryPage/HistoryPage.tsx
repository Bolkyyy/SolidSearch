import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import ErrorToast from "../../components/ErrorToast/ErrorToast";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { HistoryItem, historyApi } from "@/api/historyApi";

type FilterMap = { period?: string; source?: string; format?: string };

const FILTER_LABELS: Record<string, string> = {
  period: "Период",
  source: "Источник",
  format: "Формат",
};

const FILTER_COLORS: Record<string, string> = {
  period: "filter-badge-period",
  source: "filter-badge-source",
  format: "filter-badge-format",
};

const FiltersBadges = ({ filters }: { filters?: FilterMap | null }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!filters) return <span className="history-no-filters">—</span>;

  const active = Object.entries(filters).filter(
    ([, v]) => v && v !== "all",
  ) as [string, string][];

  if (active.length === 0) return <span className="history-no-filters">—</span>;

  const [first, ...rest] = active;

  return (
    <div className="filter-badges-wrap" ref={ref}>
      <span className={`filter-badge ${FILTER_COLORS[first[0]]}`}>
        {FILTER_LABELS[first[0]]}: {first[1]}
      </span>

      {rest.length > 0 && (
        <>
          <button
            className="filter-badge-more"
            onClick={() => setOpen((p) => !p)}
          >
            +{rest.length}
          </button>
          {open && (
            <div className="filter-popup">
              <div className="filter-popup-title">Все фильтры</div>
              {active.map(([key, val]) => (
                <div key={key} className="filter-popup-row">
                  <span className={`filter-badge ${FILTER_COLORS[key]}`}>
                    {FILTER_LABELS[key]}: {val}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
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
    const userId = localStorage.getItem("userId");
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
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const repeatSearch = (item: HistoryItem) => {
    const userId = localStorage.getItem("userId");
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
      const userId = localStorage.getItem("userId");
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
              className="history-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <i className="fa fa-chevron-left" />
            </button>

            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span
                  key={`dots-${i}`}
                  className="history-page-btn history-page-dots"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  className={`history-page-btn${currentPage === p ? " active" : ""}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ),
            )}

            <button
              className="history-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <i className="fa fa-chevron-right" />
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
