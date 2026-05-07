import Layout from "../../components/Layout/Layout";
import { useState } from "react";
import axios from "axios";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setMessage("Ошибка: пользователь не авторизован");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // Сохраняем запрос в search_queries
      await axios.post("http://localhost:3001/search-queries", {
        user_id: Number(userId),
        query_text: query,
      });
      setMessage(`Запрос "${query}" успешно сохранён`);
      // Здесь можно добавить реальный поиск
    } catch (err: any) {
      console.error(err);
      setMessage("Ошибка при сохранении запроса");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="search-page-content">
        <div className="ai-status-badge">
          <i className="fa fa-sparkles"></i>
          <span>Поиск по архивам</span>
        </div>

        <div className="hero-section">
          <h1 className="hero-title">Найдите любой документ за секунды</h1>
          <p className="hero-subtitle">Введите запрос и получите точные результаты</p>
        </div>

        <div className="ai-search-container">
          <form onSubmit={handleSearch} className="ai-search-box">
            <i className="fa fa-search search-icon-main"></i>
            <input
              type="text"
              placeholder="Введите запрос"
              className="ai-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
            <div className="ai-search-actions">
              <i className="fa fa-microphone mic-icon"></i>
              <button type="submit" className="ai-search-btn" disabled={isLoading}>
                {isLoading ? "Поиск..." : "Найти"}
                <i className="fa fa-arrow-right"></i>
              </button>
            </div>
          </form>

          <div className="query-examples">
            <span className="examples-label">Примеры запросов:</span>
            <div className="chips-container">
              <span className="chip">Найти договор на ремонт путей за 2019 год</span>
              <span className="chip">Показать акты с подрядчиком за 2021 год</span>
              <span className="chip">Какие документы содержат сумму выше 5 млн рублей</span>
            </div>
          </div>
        </div>

        <div className="quick-filters-section">
          <h3 className="filters-title">Быстрые фильтры</h3>
          <div className="filters-grid">
            <div className="filter-item">
              <label>Тип документа</label>
              <select className="filter-select">
                <option>Все</option>
                <option>Договор</option>
                <option>Акт</option>
                <option>Смета</option>
                <option>Отчет</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Период</label>
              <select className="filter-select">
                <option>Все время</option>
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Источник</label>
              <select className="filter-select">
                <option>Все</option>
                <option>Архив</option>
                <option>Текущие</option>
                <option>Импорт</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Подразделение</label>
              <select className="filter-select">
                <option>Все</option>
                <option>ФЭС</option>
                <option>ТЭЧ</option>
                <option>АХО</option>
                <option>ПТО</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Формат</label>
              <select className="filter-select">
                <option>Все</option>
                <option>PDF</option>
                <option>DOCX</option>
                <option>TXT</option>
              </select>
            </div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card blue-card">
            <div className="feature-icon"><i className="fa fa-question-circle"></i></div>
            <h4>Естественный язык</h4>
            <p>Спрашивайте как обычно: "Найди договор с компанией Х"</p>
          </div>
          <div className="feature-card purple-card">
            <div className="feature-icon"><i className="fa fa-check-double"></i></div>
            <h4>Точные цитаты</h4>
            <p>Каждый ответ подкреплен ссылками на источники</p>
          </div>
          <div className="feature-card teal-card">
            <div className="feature-icon"><i className="fa fa-bolt"></i></div>
            <h4>Быстро</h4>
            <p>Ответ за 1-2 секунды из миллионов документов</p>
          </div>
        </div>

        {message && (
          <div style={{ marginTop: "20px", padding: "10px", background: "#e0f7fa", borderRadius: "8px" }}>
            {message}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;