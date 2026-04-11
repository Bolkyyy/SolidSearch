import React, { useState } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import logo from "./Images/BlackLogo.svg";
import axios from "axios";

//СТРАНИЦА ЛОГИНА
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Введите Email";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Некорректный формат почты";
    }

    if (!password) {
      newErrors.password = "Введите пароль";
    } else if (password.length < 7) {
      newErrors.password = "Пароль должен содержать не менее 7 символов";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const response = await axios.post("http://localhost:3001/users/login", {
        email: email,
        password: password,
      });

      const userData = response.data;
      console.log("Ответ от сервера:", userData);

      if (userData?.full_name && typeof window !== "undefined") {
        localStorage.setItem("userFullName", userData.full_name);
      }

      navigate("/home", { state: { user: userData } });
    } catch (error) {
      console.error("Ошибка при логине:", error);
      setErrors({
        server:
          error.response?.data?.message ||
          "Ошибка авторизации. Проверьте данные.",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="overlay"></div>
        <div className="theme-toggle">
          <div className="toggle-circle"></div>
        </div>

        <img className="logo" src={logo} alt="SolidSearch Logo" />
        <p className="subtitle">
          AI-powered система поиска и аналитики документов
        </p>

        <h2 className="login-title">Вход в систему</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              placeholder="example@company.com"
              className={`input-field ${errors.email ? "input-error" : ""}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">Пароль</label>
            <input
              type="password"
              placeholder="*************"
              className={`input-field ${errors.password ? "input-error" : ""}`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {errors.server && <div className="server-error">{errors.server}</div>}

          <div className="options">
            <label className="checkbox-label">
              <input type="checkbox" /> Запомнить меня
            </label>
            <a href="#" className="forgot-link">
              Забыли пароль?
            </a>
          </div>

          <button type="submit" className="login-btn">
            Войти в систему
          </button>
        </form>

        <hr className="divider" />

        <div className="demo-box">
          <strong>Демо-доступ</strong>
          <br />
          <span>Email: demo1@company.ru</span>
          <br />
          <span>Пароль: demo123</span>
        </div>

        <hr className="divider" />
        <p className="footer">© 2026 SolidSearch. Все права защищены.</p>
      </div>
    </div>
  );
};

//ГЛАВНАЯ
const HomePage = () => {
  const [documents, setDocuments] = React.useState([]);
  const [indexJobs, setIndexJobs] = React.useState([]);
  const [searchQueries, setSearchQueries] = React.useState([]);
  const [userName, setUserName] = React.useState("");
  const location = useLocation();

  React.useEffect(() => {
    //всего файлов
    axios.get("http://localhost:3001/documents")
      .then((response) => {
        setDocuments(response.data);
      })
      .catch((err) => console.error("Ошибка загрузки документов:", err));

    //Количество индексированных файлов
    axios.get("http://localhost:3001/index_jobs")
      .then((response) => {
        setIndexJobs(response.data);
      })
      .catch((err) => console.error(err));

    //Запросы за сегодня
    axios.get("http://localhost:3001/search_queries")
      .then((response) => {
        setSearchQueries(response.data);
      })
      .catch((err) =>
        console.error("Ошибка загрузки поисковых запросов:", err),
      );

    //Имя
    let currentName = location.state?.user?.full_name;

    if (currentName) {
      setUserName(currentName);
      if (typeof window !== "undefined") {
        localStorage.setItem("userFullName", currentName);
      }
    } else if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userFullName");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, [location.state]);

  //Количество документов
  const newDocsCount = documents.filter((doc) => {
    const docDate = new Date(doc.created_at);
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return docDate > dayAgo;
  }).length;

  //Количество индексированных док-ов
  const recentJobsCount = indexJobs.filter((job) => {
    const jobDate = new Date(job.created_at);
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return jobDate > dayAgo;
  }).length;

  const indexedDocs = documents.filter((doc) => doc.status === "indexed").length;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const jobsToday = searchQueries.filter(
    (q) => new Date(q.created_at) >= todayStart,
  ).length;

  const jobsYesterday = searchQueries.filter((q) => {
    const d = new Date(q.created_at);
    return d >= yesterdayStart && d < todayStart;
  }).length;

  let jobDiffPercent = 0;
  if (jobsYesterday > 0) {
    jobDiffPercent = Math.round(
      ((jobsToday - jobsYesterday) / jobsYesterday) * 100,
    );
  } else if (jobsToday > 0) {
    jobDiffPercent = 100;
  }

  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">AI-поиск по документам</span>
        </div>

        <div className="nav-link active"><i className="fa fa-home" /> Главная</div>
        <Link to="/search" className="nav-link"><div><i className="fa fa-search" /> Поиск</div></Link>
        <Link to="/collections" className="nav-link"><div><i className="fa fa-folder-open" /> Архив документов</div></Link>
        <Link to="/history" className="nav-link"><div><i className="fa fa-history" /> История запросов</div></Link>
        <Link to="/analytics" className="nav-link"><div><i className="fa fa-line-chart" /> Аналитика</div></Link>
        <Link to="/indexing" className="nav-link"><div><i className="fa fa-database" />Индексация</div></Link>

        <div className="sidebar-divider" />
        <Link to="/settings" className="nav-link"><div><i className="fa fa-cog"/> Настройки</div></Link>
        
        <div className="logout">
          <Link to="/" className="exit"><i className="fa fa-sign-out" />{" "}Выход</Link>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top-row">
            <div className="search-wrapper">
              <i className="fa fa-search" />
              <input
                type="text"
                className="search-bar"
                placeholder="Быстрый поиск..."
              />
            </div>

            <div className="user-section">
              <div className="header-action-icons">
                <div className="action-btn green-text">
                  <i className="fa fa-upload" />
                </div>
                <div className="action-btn">
                  <i className="fa fa-bell" />
                </div>
              </div>
              <div className="vertical-line" />
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-name">{userName || "Пользователь"}</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar">
                  <i className="fa fa-user-circle" />
                </div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>

        <section className="welcome">
          <h1>Добро пожаловать!</h1>
          <p className="welcome-link">Обзор активности и статистика системы</p>
        </section>

        <div className="stats-grid">
          <div className="stat-card">
            <i className="fa fa-file-text card-icon blue" />
            <p>Всего документов</p>
            <h2>{documents.length}</h2>
            <span className="trend-up">+{newDocsCount}</span>
          </div>
          <div className="stat-card-green">
            <i className="fa fa-check-circle card-icon green" />
            <p>Проиндексировано</p>
            <h2>{indexedDocs}</h2>
            <span className="trend-up-index">+{recentJobsCount}</span>
          </div>
          <div className="stat-card-viol">
            <i className="fa fa-bolt card-icon purple" />
            <p>Запросов сегодня</p>
            <h2>{jobsToday}</h2>
            <span
              className={
                jobDiffPercent >= 0 ? "trend-up-request" : "trend-down"
              }
            >
              {jobDiffPercent >= 0 ? `+${jobDiffPercent}` : jobDiffPercent}%
            </span>
          </div>
          <div className="stat-card-orange">
            <i className="fa fa-history card-icon orange" />
            <p>Среднее время отчета</p>
            <h2>1.2 сек</h2>
            <span className="trend-down">-0.2 сек</span>
          </div>
        </div>

        <div className="bottom-sections">
          <div className="panel">
            <div className="panel-header">
              <h3>Последняя активность</h3>
              <i className="fa fa-line-chart panel-header-icon green" />
            </div>

            <div className="activity-item multi-line">
              <div className="activity-row">
                <span className="user-name-small">Иван Петров</span>
                <span className="time">2 мин назад</span>
              </div>
              <div className="activity-row">
                <span className="search-query">Поиск: "Договоры"</span>
                <span className="results-count">12 результатов</span>
              </div>
            </div>

            <div className="activity-item multi-line">
              <div className="activity-row">
                <span className="user-name-small">Мария Сидорова</span>
                <span className="time">15 мин назад</span>
              </div>
              <div className="activity-row">
                <span className="search-query">Открыт: "Смета_ремонт.pdf"</span>
                <span className="results-count">1 файл</span>
              </div>
            </div>

            <div className="view-all-history">Вся история →</div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Популярные темы</h3>
              <i className="fa fa-bar-chart panel-header-icon purple" />
            </div>
            <div className="activity-item">
              Договоры на ремонт <span className="trend-up-request">+12%</span>
            </div>
            <div className="activity-item">
              Сметы и расчеты <span className="trend-up-request">+7%</span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Быстрый доступ к коллекциям</h3>
              <i className="fa fa-th panel-header-icon orange" />
            </div>

            <button className="Collection">
              Архив 2024 <span className="label orange">Готово</span>
            </button>

            <button className="Collection">
              Текущие проекты <span className="label orange">Индексация</span>
            </button>

            <div className="view-all-bottom">Все коллекции →</div>
          </div>
        </div>
      </main>
    </div>
  );
};

// СТРАНИЦА ПОИСКА

const SearchPage = () => {
  const [userName, setUserName] = React.useState("");
  const location = useLocation();
  React.useEffect(() => {
    //Имя
    let currentName = location.state?.user?.full_name;

    if (currentName) {
      setUserName(currentName);
      if (typeof window !== "undefined") {
        localStorage.setItem("userFullName", currentName);
      }
    } else if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userFullName");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, [location.state]);
  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">AI-поиск по документам</span>
        </div>

        <Link to="/home" className="nav-link"> <div> <i className="fa fa-home" /> Главная </div></Link>
        <div className="nav-link active"><i className="fa fa-search" /> Поиск </div>
        <Link to="/collections" className="nav-link"><div><i className="fa fa-folder-open" /> Архив документов </div></Link>
        <Link to="/history" className="nav-link"><div><i className="fa fa-history" /> История запросов</div></Link>
        <Link to="/analytics" className="nav-link"><div><i className="fa fa-line-chart" /> Аналитика</div></Link>
        <Link to="/indexing" className="nav-link"><div><i className="fa fa-database" />Индексация</div></Link>
        <div className="sidebar-divider" />
        <Link to="/settings" className="nav-link"><div><i className="fa fa-cog" /> Настройки</div></Link>
        
        <div className="logout">
          <i className="fa fa-sign-out" />
          <Link to="/" className="exit">{" "}Выход</Link>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top-row">
            <div className="search-wrapper">
              <i className="fa fa-search" />
              <input
                type="text"
                className="search-bar"
                placeholder="Быстрый поиск..."
              />
            </div>

            <div className="user-section">
              <div className="header-action-icons">
                <div className="action-btn green-text">
                  <i className="fa fa-upload" />
                </div>
                <div className="action-btn">
                  <i className="fa fa-bell" />
                </div>
              </div>
              <div className="vertical-line" />
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-name">{userName || "Пользователь"}</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar">
                  <i className="fa fa-user-circle" />
                </div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>

        <div className="search-page-content">
          <div className="ai-status-badge">
            <i className="fa fa-sparkles"></i>
            <span>AI-powered поиск по архивам</span>
          </div>

          <div className="hero-section">
            <h1 className="hero-title">Найдите любой документ за секунды</h1>
            <p className="hero-subtitle">
              Задавайте вопросы на естественном языке и получайте точные ответы
              с цитатами
            </p>
          </div>

          <div className="ai-search-container">
            <div className="ai-search-box">
              <i className="fa fa-search search-icon-main"></i>
              <input
                type="text"
                placeholder="Введите запрос"
                className="ai-input"
              />
              <div className="ai-search-actions">
                <i className="fa fa-microphone mic-icon"></i>
                <button className="ai-search-btn">
                  Найти <i className="fa fa-arrow-right"></i>
                </button>
              </div>
            </div>

            <div className="query-examples">
              <span className="examples-label">Примеры запросов:</span>
              <div className="chips-container">
                <span className="chip">
                  Найти договор на ремонт путей за 2019 год
                </span>
                <span className="chip">
                  Показать акты с подрядчиком за 2021 год
                </span>
                <span className="chip">
                  Какие документы содержат сумму выше 5 млн рублей
                </span>
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
                </select>
              </div>
              <div className="filter-item">
                <label>Период</label>
                <select className="filter-select">
                  <option>Все время</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Источник</label>
                <select className="filter-select">
                  <option>Все</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Подразделение</label>
                <select className="filter-select">
                  <option>Все</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Формат</label>
                <select className="filter-select">
                  <option>Все</option>
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
      </main>
    </div>
  );
};

// СТРАНИЦА АРХИИВА

const CollectionPage = () => {
  const [documents, setDocument] = React.useState([])
  const [userName, setUserName] = React.useState("");
  const location = useLocation();

  React.useEffect(() => {
    axios.get("http://localhost:3001/documents")
    .then((response) => {
      setDocument(response.data)
    })
    .catch((err) => console.error("Ошибка", err));



    //Имя
    let currentName = location.state?.user?.full_name;

    if (currentName) {
      setUserName(currentName);
      if (typeof window !== "undefined") {
        localStorage.setItem("userFullName", currentName);
      }
    } else if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userFullName");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, [location.state]);
  const indexed = documents.filter((doc) => doc.status === "indexed").length;
  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">AI-поиск по документам</span>
        </div>

        <Link to="/home" className="nav-link">
          <div>
            <i className="fa fa-home" /> Главная
          </div>
        </Link>
        <Link to="/search" className="nav-link">
          <div>
            <i className="fa fa-search" /> Поиск
          </div>
        </Link>
        <div className="nav-link active">
          <i className="fa fa-folder-open" /> Архив документов
        </div>
        <Link to="/history" className="nav-link">
          <div>
            <i className="fa fa-history" /> История запросов
          </div>
        </Link>
        <Link to="/analytics" className="nav-link">
          <div>
            <i className="fa fa-line-chart" /> Аналитика
          </div>
        </Link>
        <Link to="/indexing" className="nav-link">
          <div>
            <i className="fa fa-database" />
            Индексация
          </div>
        </Link>

        <div className="sidebar-divider" />
        <Link to="/settings" className="nav-link">
          <div>
            <i className="fa fa-cog" /> Настройки
          </div>
        </Link>
        <div className="logout">
          <i className="fa fa-sign-out" />
          <Link to="/" className="exit">
            {" "}
            Выход
          </Link>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top-row">
            <div className="search-wrapper">
              <i className="fa fa-search" />
              <input
                type="text"
                className="search-bar"
                placeholder="Быстрый поиск..."
              />
            </div>

            <div className="user-section">
              <div className="header-action-icons">
                <div className="action-btn green-text">
                  <i className="fa fa-upload" />
                </div>
                <div className="action-btn">
                  <i className="fa fa-bell" />
                </div>
              </div>
              <div className="vertical-line" />
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-name">{userName || "Пользователь"}</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar">
                  <i className="fa fa-user-circle" />
                </div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
        
        <div className="archive-page">
          <div className="archive-header-wrapper">
            <div className="archive-header-text">
              <h1 className="archive-title">Архив документов</h1>
              <p className="archive-description">
                Управление коллекциями и архивами документов
              </p>
            </div>
            <button className="create-collection-btn">
              <i className="fa fa-plus"></i> Создать коллекцию
            </button>
          </div>

          <div className="stats-cards">
            <div className="stat-card-archive">
              <div className="stat-value green">6</div>
              <div className="stat-label">Всего коллекций</div>
            </div>
            <div className="stat-card-archive">
              <div className="stat-value blue">{documents.length}</div>
              <div className="stat-label">Всего документов</div>
            </div>
            <div className="stat-card-archive">
              <div className="stat-value purple">{indexed}</div>
              <div className="stat-label">Проиндексировано</div>
            </div>
            <div className="stat-card-archive">
              <div className="stat-value orange">1</div>
              <div className="stat-label">Требуют внимания</div>
            </div>
          </div>

          <div className="archives-grid">
            <div className="archive-item">
              <div className="archive-item-header">
                <h3>Архив 2024</h3>
              </div>
              <div className="archive-info">
                <span>3 245 документов</span>
                <div className="file-formats">
                  <span className="format-badge format-pdf">PDF</span>
                  <span className="format-badge format-docx">DOCX</span>
                  <span className="format-badge format-txt">TXT</span>
                </div>
                <span>2.4 ГБ</span>
              </div>
              <div className="archive-buttons">
                <button className="btn-open">Открыть</button>
                <button className="btn-reindex">Переиндексировать</button>
              </div>
            </div>

            <div className="archive-item">
              <div className="archive-item-header">
                <h3>Архив 2023</h3>
              </div>
              <div className="archive-info">
                <span>8 134 документов</span>
                <div className="file-formats">
                  <span className="format-badge format-pdf">PDF</span>
                  <span className="format-badge format-docx">DOCX</span>
                  <span className="format-badge format-txt">TXT</span>
                </div>
                <span>5.8 ГБ</span>
              </div>
              <div className="archive-buttons">
                <button className="btn-open">Открыть</button>
                <button className="btn-reindex">Переиндексировать</button>
              </div>
            </div>

            <div className="archive-item">
              <div className="archive-item-header">
                <h3>Текущие проекты</h3>
              </div>
              <div className="archive-info">
                <span>456 документов</span>
                <div className="file-formats">
                  <span className="format-badge format-pdf">PDF</span>
                  <span className="format-badge format-docx">DOCX</span>
                  <span className="format-badge format-txt">TXT</span>
                  <span className="format-badge format-xlsx">XLSX</span>
                </div>
                <span>890 МБ</span>
              </div>
              <div className="archive-buttons">
                <button className="btn-open">Открыть</button>
                <button className="btn-reindex">Переиндексировать</button>
              </div>
            </div>

            <div className="archive-item">
              <div className="archive-item-header">
                <h3>Финансовые документы</h3>
              </div>
              <div className="archive-info">
                <span>1 234 документов</span>
                <div className="file-formats">
                  <span className="format-badge format-pdf">PDF</span>
                  <span className="format-badge format-docx">DOCX</span>
                  <span className="format-badge format-txt">TXT</span>
                </div>
                <span>42 ГБ</span>
              </div>
              <div className="archive-buttons">
                <button className="btn-open">Открыть</button>
                <button className="btn-reindex">Переиндексировать</button>
              </div>
            </div>

            <div className="archive-item">
              <div className="archive-item-header">
                <h3>Финансовые документы</h3>
              </div>
              <div className="archive-info">
                <span>1 234 документов</span>
                <div className="file-formats">
                  <span className="format-badge format-pdf">PDF</span>
                  <span className="format-badge format-docx">DOCX</span>
                  <span className="format-badge format-txt">TXT</span>
                </div>
                <span>340 МБ</span>
              </div>
              <div className="archive-buttons">
                <button className="btn-open">Открыть</button>
                <button className="btn-reindex">Переиндексировать</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// СТРАНИЦА ИСТОРИИ ЗАПРОСОВ

const HistoryPage = () => {
  const [userName, setUserName] = React.useState("");
  const location = useLocation();
  React.useEffect(() => {
    //Имя
    let currentName = location.state?.user?.full_name;

    if (currentName) {
      setUserName(currentName);
      if (typeof window !== "undefined") {
        localStorage.setItem("userFullName", currentName);
      }
    } else if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userFullName");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, [location.state]);
  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">AI-поиск по документам</span>
        </div>

        <Link to="/home" className="nav-link">
          <div>
            <i className="fa fa-home" /> Главная
          </div>
        </Link>
        <Link to="/search" className="nav-link">
          <div>
            <i className="fa fa-search" /> Поиск
          </div>
        </Link>
        <Link to="/collections" className="nav-link">
          <div>
            <i className="fa fa-folder-open" /> Архив документов
          </div>
        </Link>
        <div className="nav-link active">
          <i className="fa fa-history" /> История запросов
        </div>
        <Link to="/analytics" className="nav-link">
          <div>
            <i className="fa fa-line-chart" /> Аналитика
          </div>
        </Link>
        <Link to="/indexing" className="nav-link">
          <div>
            <i className="fa fa-database" />
            Индексация
          </div>
        </Link>

        <div className="sidebar-divider" />
        <Link to="/settings" className="nav-link">
          <div>
            <i className="fa fa-cog" /> Настройки
          </div>
        </Link>
        <div className="logout">
          <i className="fa fa-sign-out" />
          <Link to="/" className="exit">
            {" "}
            Выход
          </Link>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top-row">
            <div className="search-wrapper">
              <i className="fa fa-search" />
              <input
                type="text"
                className="search-bar"
                placeholder="Быстрый поиск..."
              />
            </div>

            <div className="user-section">
              <div className="header-action-icons">
                <div className="action-btn green-text">
                  <i className="fa fa-upload" />
                </div>
                <div className="action-btn">
                  <i className="fa fa-bell" />
                </div>
              </div>
              <div className="vertical-line" />
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-name">{userName || "Пользователь"}</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar">
                  <i className="fa fa-user-circle" />
                </div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
        <section className="welcome">
          <h1>История запросов</h1>
          <p className="welcome-link">Обзор активности и статистика системы</p>
        </section>
        <div className="history-filters">
          {['all', 'success', 'error', 'pending'].map(f => (
            <button
              key={f}
              className={`history-filter-btn`}
            >
              {{ all: 'Все', success: 'Успешные', error: 'Ошибки', pending: 'В ожидании' }[f]}
            </button>
          ))}
          <div className="history-search">
            <i className="fa fa-search" />
            <input
              type="text"
              placeholder="Поиск по запросам..."
            />
          </div>
        </div>

        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Запрос</th>
                <th>Пользователь</th>
                <th>Дата и время</th>
                <th>Результаты</th>
                <th>Статус</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
                <tr >
                  <td><div className="history-query-text">1</div></td>
                  <td><span className="history-user">1</span></td>
                  <td><span className="history-date">2</span></td>
                  <td><span className="history-results">3</span></td>
                  <td>
                    <span className={`history-badge`}>
                    </span>
                  </td>
                  <td>
                    <button className="history-action-btn">
                      <i className="fa fa-repeat" /> Повторить
                    </button>
                  </td>
                </tr>
            </tbody>
          </table>
          <div className="history-pagination">
            <span className="history-pagination-info">
              Показано 3 из 4 записей
            </span>
            <div className="history-pagination-controls">
              <button className="history-page-btn"><i className="fa fa-chevron-left" /></button>
              <button className="history-page-btn active">1</button>
              <button className="history-page-btn">2</button>
              <button className="history-page-btn">3</button>
              <button className="history-page-btn"><i className="fa fa-chevron-right" /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// СТРАНИЦА АНАЛИТИКИ

const AnalyticsPage = () => {
  const [userName, setUserName] = React.useState("");
  const location = useLocation();
  React.useEffect(() => {
    //Имя
    let currentName = location.state?.user?.full_name;

    if (currentName) {
      setUserName(currentName);
      if (typeof window !== "undefined") {
        localStorage.setItem("userFullName", currentName);
      }
    } else if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userFullName");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, [location.state]);
  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">AI-поиск по документам</span>
        </div>

        <Link to="/home" className="nav-link">
          <div>
            <i className="fa fa-home" /> Главная
          </div>
        </Link>
        <Link to="/search" className="nav-link">
          <div>
            <i className="fa fa-search" /> Поиск
          </div>
        </Link>
        <Link to="/collections" className="nav-link">
          <div>
            <i className="fa fa-folder-open" /> Архив документов
          </div>
        </Link>
        <Link to="/history" className="nav-link">
          <div>
            <i className="fa fa-history" /> История запросов
          </div>
        </Link>
        <div className="nav-link active">
          <i className="fa fa-line-chart" /> Аналитика
        </div>
        <Link to="/indexing" className="nav-link">
          <div>
            <i className="fa fa-database" />
            Индексация
          </div>
        </Link>

        <div className="sidebar-divider" />
        <Link to="/settings" className="nav-link">
          <div>
            <i className="fa fa-cog" /> Настройки
          </div>
        </Link>
        <div className="logout">
          <i className="fa fa-sign-out" />
          <Link to="/" className="exit">
            {" "}
            Выход
          </Link>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top-row">
            <div className="search-wrapper">
              <i className="fa fa-search" />
              <input
                type="text"
                className="search-bar"
                placeholder="Быстрый поиск..."
              />
            </div>

            <div className="user-section">
              <div className="header-action-icons">
                <div className="action-btn green-text">
                  <i className="fa fa-upload" />
                </div>
                <div className="action-btn">
                  <i className="fa fa-bell" />
                </div>
              </div>
              <div className="vertical-line" />
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-name">{userName || "Пользователь"}</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar">
                  <i className="fa fa-user-circle" />
                </div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
        <section className="welcome">
          <h1>Аналитика</h1>
          <p className="welcome-link">Статистика использования и эффективности системы</p>
        </section>
        {/* Дальше код писать сюда */}
      </main>
    </div>
  );
};

// СТРАНИЦА ИНДЕКСАЦИИ

const IndexingPage = () => {
  const [userName, setUserName] = React.useState("");
  const location = useLocation();
  React.useEffect(() => {
    //Имя
    let currentName = location.state?.user?.full_name;

    if (currentName) {
      setUserName(currentName);
      if (typeof window !== "undefined") {
        localStorage.setItem("userFullName", currentName);
      }
    } else if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userFullName");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, [location.state]);
  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">AI-поиск по документам</span>
        </div>

        <Link to="/home" className="nav-link">
          <div>
            <i className="fa fa-home" /> Главная
          </div>
        </Link>
        <Link to="/search" className="nav-link">
          <div>
            <i className="fa fa-search" /> Поиск
          </div>
        </Link>
        <Link to="/collections" className="nav-link">
          <div>
            <i className="fa fa-folder-open" /> Архив документов
          </div>
        </Link>
        <Link to="/history" className="nav-link">
          <div>
            <i className="fa fa-history" /> История запросов
          </div>
        </Link>
        <Link to="/analytics" className="nav-link">
          <div>
            <i className="fa fa-line-chart" /> Аналитика
          </div>
        </Link>
        <div className="nav-link active">
          <i className="fa fa-database" />
          Индексация
        </div>

        <div className="sidebar-divider" />
        <Link to="/settings" className="nav-link">
          <div>
            <i className="fa fa-cog" /> Настройки
          </div>
        </Link>
        <div className="logout">
          <i className="fa fa-sign-out" />
          <Link to="/" className="exit">
            {" "}
            Выход
          </Link>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top-row">
            <div className="search-wrapper">
              <i className="fa fa-search" />
              <input
                type="text"
                className="search-bar"
                placeholder="Быстрый поиск..."
              />
            </div>

            <div className="user-section">
              <div className="header-action-icons">
                <div className="action-btn green-text">
                  <i className="fa fa-upload" />
                </div>
                <div className="action-btn">
                  <i className="fa fa-bell" />
                </div>
              </div>
              <div className="vertical-line" />
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-name">{userName || "Пользователь"}</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar">
                  <i className="fa fa-user-circle" />
                </div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
        <section className="welcome">
          <h1>Управление индексацией</h1>
          <p className="welcome-link">Загрузка и индексация новых документов</p>
        </section>
                <div className="indexing-page-content">
          
          <div className="indexing-stats-grid">
            <div className="stat-card orange">
              <div className="stat-info">
                <span className="stat-label">В очереди</span>
                <span className="stat-value">1</span>
              </div>
              <i className="fa fa-clock stat-icon"></i>
            </div>
            <div className="stat-card purple">
              <div className="stat-info">
                <span className="stat-label">Обрабатывается</span>
                <span className="stat-value">2</span>
              </div>
              <i className="fa fa-play-circle stat-icon"></i>
            </div>
            <div className="stat-card green">
              <div className="stat-info">
                <span className="stat-label">Проиндексировано</span>
                <span className="stat-value">2</span>
              </div>
              <i className="fa fa-check-circle stat-icon"></i>
            </div>
            <div className="stat-card red">
              <div className="stat-info">
                <span className="stat-label">Ошибки</span>
                <span className="stat-value">1</span>
              </div>
              <i className="fa fa-exclamation-circle stat-icon"></i>
            </div>
          </div>

          <div className="upload-dropzone">
            <div className="upload-icon-circle">
              <i className="fa fa-upload"></i>
            </div>
            <h3>Загрузите документы для индексации</h3>
            <p>Перетащите файлы сюда или нажмите для выбора</p>
            <div className="upload-buttons">
              <button className="btn-upload primary">Выбрать файлы</button>
              <button className="btn-upload primary">Выбрать папку</button>
            </div>
            <span className="upload-hint">Поддерживаемые форматы: PDF, DOCX, TXT, XLSX</span>
          </div>

          <div className="indexing-queue-container">
            <div className="queue-header">
              <h3>Очередь индексации</h3>
              <div className="queue-actions">
                <button className="btn-action orange"><i className="fa fa-pause"></i> Приостановить все</button>
                <button className="btn-action red"><i className="fa fa-times"></i> Очистить завершённые</button>
              </div>
            </div>

            <div className="queue-list">
              <div className="queue-item processing">
                <div className="item-main">
                  <div className="item-icon purple"><i className="fa fa-play-circle"></i></div>
                  <div className="item-details">
                    <div className="item-title">Договор_451_2019.pdf</div>
                    <div className="item-meta">Архив 2024 <span className="status-text">Обрабатывается</span></div>
                  </div>
                  <div className="item-progress-info">
                    <span className="step-name">Извлечение текста</span>
                    <span className="time-info">Начало в 10:30</span>
                  </div>
                </div>
                <div className="progress-container">
                  <div className="progress-bar" style={{width: '45%'}}></div>
                  <span className="progress-percent">45%</span>
                </div>
              </div>

              <div className="queue-item processing">
                <div className="item-main">
                  <div className="item-icon purple"><i className="fa fa-play-circle"></i></div>
                  <div className="item-details">
                    <div className="item-title">Акт_выполненных_работ_128.docx</div>
                    <div className="item-meta">Архив 2024 <span className="status-text">Обрабатывается</span></div>
                  </div>
                  <div className="item-progress-info">
                    <span className="step-name">Создание векторов</span>
                    <span className="time-info">Начало в 10:28</span>
                  </div>
                </div>
                <div className="progress-container">
                  <div className="progress-bar" style={{width: '78%'}}></div>
                  <span className="progress-percent">78%</span>
                </div>
              </div>

              <div className="queue-item waiting">
                <div className="item-main">
                  <div className="item-icon orange"><i className="fa fa-clock"></i></div>
                  <div className="item-details">
                    <div className="item-title">Смета_проект_2024.xlsx</div>
                    <div className="item-meta">Текущие проекты <span className="status-tag orange">В очереди</span></div>
                  </div>
                  <div className="item-status-right">
                    <span>В очереди</span>
                    <span className="time-info">--:--</span>
                  </div>
                </div>
              </div>

              <div className="queue-item completed">
                <div className="item-main">
                  <div className="item-icon green"><i className="fa fa-check-circle"></i></div>
                  <div className="item-details">
                    <div className="item-title">Техническое_задание.pdf</div>
                    <div className="item-meta">Текущие проекты <span className="status-tag green">Проиндексирован</span></div>
                  </div>
                  <div className="item-status-right">
                    <span>Проиндексирован</span>
                    <span className="time-info">Завершено в 10:25</span>
                  </div>
                </div>
              </div>

              <div className="queue-item error">
                <div className="item-main">
                  <div className="item-icon red"><i className="fa fa-exclamation-circle"></i></div>
                  <div className="item-details">
                    <div className="item-title">Скан_документа_неразборчиво.pdf</div>
                    <div className="item-meta">Архив 2023 <span className="status-tag red">Ошибка</span></div>
                  </div>
                  <div className="item-status-right">
                    <span>Проиндексирован</span>
                    <span className="time-info">Завершено в 10:25</span>
                  </div>
                </div>
                <div className="error-message-box">
                   <p>Не удалось распознать текст</p>
                   <button className="retry-link">Попробовать снова</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// СТРАНИЦА НАСТРОЕК!!!

const SettingsPage = () => {
  const [userName, setUserName] = React.useState("");
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState("users"); // ДОБАВИЛ ВОТ ЭТО !!!
  React.useEffect(() => {
    //Имя
    let currentName = location.state?.user?.full_name;

    if (currentName) {
      setUserName(currentName);
      if (typeof window !== "undefined") {
        localStorage.setItem("userFullName", currentName);
      }
    } else if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userFullName");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, [location.state]);
  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">AI-поиск по документам</span>
        </div>

        <Link to="/home" className="nav-link">
          <div>
            <i className="fa fa-home" /> Главная
          </div>
        </Link>
        <Link to="/search" className="nav-link">
          <div>
            <i className="fa fa-search" /> Поиск
          </div>
        </Link>
        <Link to="/collections" className="nav-link">
          <div>
            <i className="fa fa-folder-open" /> Архив документов
          </div>
        </Link>
        <Link to="/history" className="nav-link">
          <div>
            <i className="fa fa-history" /> История запросов
          </div>
        </Link>
        <Link to="/analytics" className="nav-link">
          <div>
            <i className="fa fa-line-chart" /> Аналитика
          </div>
        </Link>
        <Link to="/indexing" className="nav-link ">
          <div>
            <i className="fa fa-database" />
            Индексация
          </div>
        </Link>

        <div className="sidebar-divider" />
        <div className="nav-link active">
          <i className="fa fa-cog" /> Настройки
        </div>
        <div className="logout">
          <i className="fa fa-sign-out" />
          <Link to="/" className="exit">
            {" "}
            Выход
          </Link>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top-row">
            <div className="search-wrapper">
              <i className="fa fa-search" />
              <input
                type="text"
                className="search-bar"
                placeholder="Быстрый поиск..."
              />
            </div>

            <div className="user-section">
              <div className="header-action-icons">
                <div className="action-btn green-text">
                  <i className="fa fa-upload" />
                </div>
                <div className="action-btn">
                  <i className="fa fa-bell" />
                </div>
              </div>
              <div className="vertical-line" />
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-name">{userName || "Пользователь"}</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar">
                  <i className="fa fa-user-circle" />
                </div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
        <section className="welcome">
          <h1>Управление индексацией</h1>
          <p className="welcome-link">Загрузка и индексация новых документов</p>
        </section>
        {/* Дальше код писать сюда */}
        <div className="settings-container">
          {/* НАВИГАЦИЯ ПО ВКЛАДКАМ */}
          <div className="settings-tabs-nav">
            {[
              { id: "users", icon: "fa-users", label: "Пользователи и роли" },
              { id: "sources", icon: "fa-database", label: "Источники" },
              { id: "collections", icon: "fa-layer-group", label: "Коллекции" },
              { id: "models", icon: "fa-microchip", label: "Модели" },
              { id: "rules", icon: "fa-cog", label: "Правила индексации" },
              { id: "integrations", icon: "fa-plug", label: "Интеграции" },
              { id: "interface", icon: "fa-desktop", label: "Интерфейс" },
            ].map((tab) => (
              <div
                key={tab.id}
                className={`settings-tab-link ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`fa ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </div>
            ))}
          </div>

          <div className="settings-card-panel">
            {activeTab === "users" && (
              <div className="settings-view-fade">
                <div className="view-header-row">
                  <h2>Управление пользователями</h2>
                  <button className="settings-action-btn">
                    + Создать пользователя
                  </button>
                </div>
                <table className="users-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "25%" }}>Имя</th>
                      <th style={{ width: "25%" }}>Email</th>
                      <th style={{ width: "20%" }}>Роль</th>
                      <th style={{ width: "15%" }}>Статус</th>
                      <th style={{ width: "15%" }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Иван Петров</td>
                      <td className="text-muted">ivan@company.ru</td>
                      <td>Администратор</td>
                      <td>
                        <span className="badge-status success">Активен</span>
                      </td>
                      <td className="table-actions">
                        <i className="fa fa-edit"></i>
                        <i className="fa fa-trash-alt"></i>
                      </td>
                    </tr>
                    <tr>
                      <td>Мария Сидорова</td>
                      <td className="text-muted">maria@company.ru</td>
                      <td>Пользователь</td>
                      <td>
                        <span className="badge-status success">Активен</span>
                      </td>
                      <td className="table-actions">
                        <i className="fa fa-edit"></i>
                        <i className="fa fa-trash-alt"></i>
                      </td>
                    </tr>
                    <tr>
                      <td>Ольга Иванова</td>
                      <td className="text-muted">olga@company.ru</td>
                      <td>Читатель</td>
                      <td>
                        <span className="badge-status danger">Неактивен</span>
                      </td>
                      <td className="table-actions">
                        <i className="fa fa-edit"></i>
                        <i className="fa fa-trash-alt"></i>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "sources" && (
              <div className="settings-view-fade">
                <div className="view-header-row">
                  <h2>Источники данных</h2>
                  <button className="settings-action-btn">
                    + Добавить источник
                  </button>
                </div>
                <div className="source-data-card">
                  <div className="source-card-body">
                    <div className="source-title-row">
                      <h3>Основной архив</h3>
                      <span className="badge-status success-light">
                        Подключен
                      </span>
                    </div>
                    <p className="source-meta">Тип: Локальное хранилище</p>
                    <p className="source-path">
                      Путь: <code>/mnt/archive</code>
                    </p>
                  </div>
                </div>
                <div className="source-data-card">
                  <div className="source-card-body">
                    <div className="source-title-row">
                      <h3>Сетевое хранилище</h3>
                      <span className="badge-status danger-light">Ошибка</span>
                    </div>
                    <p className="source-meta">Тип: SMB</p>
                    <p className="source-path">
                      Путь: <code>\\server\docs</code>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "rules" && (
              <div className="settings-view-fade">
                <h2>Правила индексации</h2>
                <div className="indexing-block">
                  <label className="block-title">
                    Автоматическая индексация новых документов
                  </label>
                  <div className="custom-checkbox-row">
                    <i className="fa fa-check-square accent-color"></i>
                    <span>Индексировать документы сразу после загрузки</span>
                  </div>
                </div>

                <div className="indexing-block">
                  <label className="block-title">Размер чанка (токены)</label>
                  <div className="input-group-custom">
                    <div className="dark-field-input">512</div>
                    <p className="field-hint">
                      Оптимальный размер: 512-1024 токенов
                    </p>
                  </div>
                </div>

                <div className="indexing-block">
                  <label className="block-title">
                    Overlap между чанками (токены)
                  </label>
                  <div className="input-group-custom">
                    <div className="dark-field-input">128</div>
                    <p className="field-hint">
                      Рекомендуется: 10-20% от размера чанка
                    </p>
                  </div>
                </div>

                <button className="save-config-btn">
                  <i className="fa fa-save"></i> Сохранить настройки
                </button>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="settings-view-fade">
                <h2>Интеграции</h2>
                <div className="integrations-grid-layout">
                  <div className="integration-item">
                    <h3>OpenAI API</h3>
                    <p>Используется для эмбеддингов и генерации ответов</p>
                    <span className="badge-status success">Подключено</span>
                  </div>
                  <div className="integration-item">
                    <h3>Slack уведомления</h3>
                    <p>Получайте уведомления об ошибках индексации</p>
                    <span className="badge-status muted">Не настроено</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "interface" && (
              <div className="settings-view-fade">
                <h2>Интерфейс</h2>
                <div className="interface-block">
                  <label className="block-title">Тема</label>
                  <div className="ui-toggle active">
                    <div className="ui-toggle-thumb"></div>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === "collections" || activeTab === "models") && (
              <div className="settings-view-fade">
                <h2>{activeTab === "collections" ? "Коллекции" : "Модели"}</h2>
                <p className="empty-tab-text">
                  Настройки данного раздела находятся в процессе разработки или
                  перенесены в раздел "Индексация".
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/collections" element={<CollectionPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/indexing" element={<IndexingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;