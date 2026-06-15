import Layout from "../../components/Layout/Layout";
import ErrorToast from "../../components/ErrorToast/ErrorToast";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collectionsApi, Collection } from "@/api/collectionsApi";
import { session } from "@/utils/session";

const ALL_FORMATS = [
  { group: "Документы", items: ["PDF", "DOCX", "DOC", "RTF", "TXT", "MD"] },
  { group: "Таблицы",   items: ["XLS", "XLSX", "CSV", "ODS"] },
  { group: "Презентации", items: ["PPT", "PPTX"] },
  { group: "Изображения", items: ["PNG", "JPG", "TIFF", "WEBP"] },
];

const EXAMPLE_QUERIES = [
  "Найти договор на ремонт путей за 2019 год",
  "Показать акты с подрядчиком за 2021 год",
  "Какие документы содержат сумму выше 5 млн рублей",
];

const FormatDropdown = ({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (fmt: string) => {
    onChange(selected.includes(fmt) ? selected.filter((f) => f !== fmt) : [...selected, fmt]);
  };

  const label =
    selected.length === 0
      ? "Все форматы"
      : selected.length <= 3
      ? selected.join(", ")
      : `${selected.slice(0, 2).join(", ")} +${selected.length - 2}`;

  return (
    <div className="format-dropdown-wrap" ref={ref}>
      <button
        type="button"
        className={`format-dropdown-btn${selected.length > 0 ? " filter-select--active" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span>{label}</span>
        <i className={`fa fa-chevron-${open ? "up" : "down"}`} />
      </button>
      {open && (
        <div className="format-dropdown-panel">
          {selected.length > 0 && (
            <button
              type="button"
              className="format-dropdown-clear"
              onClick={() => onChange([])}
            >
              <i className="fa fa-times" /> Сбросить
            </button>
          )}
          {ALL_FORMATS.map(({ group, items }) => (
            <div key={group} className="format-group">
              <div className="format-group-label">{group}</div>
              <div className="format-group-items">
                {items.map((fmt) => (
                  <label key={fmt} className="format-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selected.includes(fmt)}
                      onChange={() => toggle(fmt)}
                    />
                    <span>{fmt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("all");
  const [source, setSource] = useState("all");
  const [collection, setCollection] = useState("all");
  const [formats, setFormats] = useState<string[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    collectionsApi.getAll().then(setCollections).catch(() => {});
  }, []);

  const hasActiveFilters = period !== "all" || source !== "all" || collection !== "all" || formats.length > 0;

  const resetFilters = () => {
    setPeriod("all");
    setSource("all");
    setCollection("all");
    setFormats([]);
  };

  const runSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const userId = session.getUserId();
    if (!userId) { setError("Ошибка: пользователь не авторизован"); return; }
    const filters = {
      period,
      source,
      collection,
      formats: formats.length > 0 ? formats.join(",") : undefined,
    };
    navigate("/search/results", { state: { query: searchQuery, userId: Number(userId), filters } });
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); runSearch(query); };
  const handleExampleClick = (ex: string) => { setQuery(ex); runSearch(ex); };

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
                <button key={ex} className="chip" onClick={() => handleExampleClick(ex)}>
                  <span>{ex}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <ErrorToast message={error} onClose={() => setError("")} />}

        <div className="quick-filters-section">
          <div className="filters-title-row">
            <h3 className="filters-title">Быстрые фильтры</h3>
            {hasActiveFilters && (
              <button className="filters-reset-btn" onClick={resetFilters}>
                <i className="fa fa-times" /> Сбросить
              </button>
            )}
          </div>
          <div className="filters-grid">
            <div className="filter-item">
              <label className={period !== "all" ? "filter-label--active" : ""}>Период</label>
              <select
                className={`filter-select${period !== "all" ? " filter-select--active" : ""}`}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="all">Все время</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            <div className="filter-item">
              <label className={source !== "all" ? "filter-label--active" : ""}>Источник</label>
              <select
                className={`filter-select${source !== "all" ? " filter-select--active" : ""}`}
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="all">Все</option>
                <option value="Архив">Архив</option>
                <option value="Текущие">Текущие</option>
                <option value="Импорт">Импорт</option>
              </select>
            </div>

            <div className="filter-item">
              <label className={collection !== "all" ? "filter-label--active" : ""}>Коллекция</label>
              <select
                className={`filter-select${collection !== "all" ? " filter-select--active" : ""}`}
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
              >
                <option value="all">Все коллекции</option>
                {collections.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label className={formats.length > 0 ? "filter-label--active" : ""}>Формат</label>
              <FormatDropdown selected={formats} onChange={setFormats} />
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
      </div>
    </Layout>
  );
};

export default SearchPage;
