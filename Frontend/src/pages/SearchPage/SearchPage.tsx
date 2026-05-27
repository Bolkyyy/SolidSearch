import Layout from "../../components/Layout/Layout";
import ErrorToast from "../../components/ErrorToast/ErrorToast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EXAMPLE_QUERIES = [
  "Найти договор на ремонт путей за 2019 год",
  "Показать акты с подрядчиком за 2021 год",
  "Какие документы содержат сумму выше 5 млн рублей",
];

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const runSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("Ошибка: пользователь не авторизован");
      return;
    }

    navigate("/search/results", {
      state: { query: searchQuery, userId: Number(userId) },
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    runSearch(example);
  };

  return (
    <Layout>
      <div className="search-page-content">
        <div className="ai-status-badge">
          <i className="fa fa-sparkles"></i>
          <span>Ai-powered поиск по архивам</span>
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
            />
            <div className="ai-search-actions">
              <i className="fa fa-microphone mic-icon"></i>
              <button type="submit" className="ai-search-btn">
                Найти <i className="fa fa-arrow-right"></i>
              </button>
            </div>
          </form>

          <div className="query-examples">
            <span className="examples-label">Примеры запросов:</span>
            <div className="chips-container">
              {EXAMPLE_QUERIES.map((ex) => (
                <button
                  key={ex}
                  className="chip"
                  onClick={() => handleExampleClick(ex)}
                >
                  <span>{ex}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <ErrorToast message={error} onClose={() => setError("")} />
        )}

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
            <div className="feature-icon">
              <i className="fa fa-question-circle"></i>
            </div>
            <h4>Естественный язык</h4>
            <p>Спрашивайте как обычно: "Найди договор с компанией Х"</p>
          </div>
          <div className="feature-card purple-card">
            <div className="feature-icon">
              <i className="fa fa-check-double"></i>
            </div>
            <h4>Точные цитаты</h4>
            <p>Каждый ответ подкреплен ссылками на источники</p>
          </div>
          <div className="feature-card teal-card">
            <div className="feature-icon">
              <i className="fa fa-bolt"></i>
            </div>
            <h4>Быстро</h4>
            <p>Ответ за 1-2 секунды из миллионов документов</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;