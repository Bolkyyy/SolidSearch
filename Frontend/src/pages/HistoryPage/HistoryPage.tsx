import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import ErrorToast from "../../components/ErrorToast/ErrorToast";
import { HistoryItem, historyApi } from "@/api/historyApi";

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

const HistoryPage = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
    return history.filter((item) =>
      item.query_text?.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
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
    ) pages.push(i);
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

  const repeatSearch = (queryText: string) => {
    const userId = localStorage.getItem("userId");
    if (!userId) { setError("Пользователь не авторизован"); return; }
    if (!queryText?.trim()) return;
    navigate("/search/results", { state: { query: queryText, userId: Number(userId) } });
  };

  const clearHistory = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    if (!window.confirm("Очистить всю историю запросов?")) return;

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
          className="history-filter-btn"
          style={{ color: "#e4585a", borderColor: "#e4585a33" }}
          disabled={clearing || history.length === 0}
          onClick={clearHistory}
        >
          {clearing ? (
            <><i className="fa fa-spinner fa-spin" /> Очистка...</>
          ) : (
            <><i className="fa fa-trash" /> Очистить историю</>
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
              className="fa fa-times"
              style={{ cursor: "pointer", color: "#555" }}
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
              <th>Результаты</th>
              <th>Статус</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#555", padding: "24px" }}>
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
                  <span className="history-date">{formatDate(item.created_at)}</span>
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
                  <button
                    className="history-action-btn"
                    onClick={() => repeatSearch(item.query_text)}
                  >
                    <i className="fa fa-repeat" /> Повторить
                  </button>
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
                  filtered.length
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
                  className="history-page-btn"
                  style={{ cursor: "default", color: "#555" }}
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
              )
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
    </Layout>
  );
};

export default HistoryPage;
