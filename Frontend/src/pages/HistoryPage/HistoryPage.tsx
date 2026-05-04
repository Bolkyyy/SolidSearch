import { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import { HistoryItem, historyApi } from "@/api/history_api";

const HistoryPage = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Поиск документов по айди пользователя
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    historyApi
      .getByUserId(Number(userId))
      .then((data) => setHistory(data))
      .catch((err) => console.error(err));
  }, []);

  // Формат времени для времени и даты
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout>
      <section className="welcome">
        <h1>История запросов</h1>
        <p className="welcome-link">Обзор активности и статистика системы</p>
      </section>
      <div className="history-filters">
        {["all", "success", "error", "pending"].map((filter) => (
          <button key={filter} className="history-filter-btn">
            {
              {
                all: "Все",
                success: "Успешные",
                error: "Ошибки",
                pending: "В ожидании",
              }[filter]
            }
          </button>
        ))}
        <div className="history-search">
          <i className="fa fa-search" />
          <input type="text" placeholder="Поиск по запросам..." />
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
            {history.length === 0 && (
              <tr>
                <td colSpan={3}>История пуста</td>
              </tr>
            )}
            {history.map((item) => (
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
                  <span className="history-results">5</span>
                </td>
                <td>
                  <span className="history-badge success">Успешно</span>
                </td>
                <td>
                  <button className="history-action-btn">
                    <i className="fa fa-repeat" /> Повторить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="history-pagination">
          <span className="history-pagination-info">
            Показано 3 из 4 записей
          </span>
          <div className="history-pagination-controls">
            <button className="history-page-btn">
              <i className="fa fa-chevron-left" />
            </button>
            <button className="history-page-btn active">1</button>
            <button className="history-page-btn">2</button>
            <button className="history-page-btn">3</button>
            <button className="history-page-btn">
              <i className="fa fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HistoryPage;
