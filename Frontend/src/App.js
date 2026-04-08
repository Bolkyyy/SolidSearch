import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import logo from './Images/BlackLogo.svg';
import axios from 'axios';

//СТРАНИЦА ЛОГИНА - МАРТЫНОВ
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Введите Email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Некорректный формат почты';
    }

    if (!password) {
      newErrors.password = 'Введите пароль';
    } else if (password.length < 7){
      newErrors.password = "Пароль должен содержать не менее 7 символов"
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const response = await axios.post('http://localhost:3001/users/login', {
        email: email,
        password: password
      });

      const userData = response.data;
      console.log('Ответ от сервера:', userData);

      if (userData?.full_name && typeof window !== 'undefined') {
        localStorage.setItem('userFullName', userData.full_name);
      }

      navigate('/home', { state: { user: userData } });

    } catch (error) {
      console.error('Ошибка при логине:', error);
      setErrors({
        server: error.response?.data?.message || 'Ошибка авторизации. Проверьте данные.'
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="overlay"></div>
        <div className="theme-toggle"><div className="toggle-circle"></div></div>
        
        <img className='logo' src={logo} alt="SolidSearch Logo" />
        <p className="subtitle">AI-powered система поиска и аналитики документов</p>
        
        <h2 className="login-title">Вход в систему</h2>
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="input-group">
          <label className="input-label">Email</label>
          <input 
            type="email" 
            placeholder="example@company.com" 
            className={`input-field ${errors.email ? 'input-error' : ''}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({...errors, email: ''});
            }} 
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        
        <div className="input-group">
          <label className="input-label">Пароль</label>
          <input 
            type="password" 
            placeholder="*************" 
            className={`input-field ${errors.password ? 'input-error' : ''}`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({...errors, password: ''});
            }} 
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        {errors.server && <div className="server-error">{errors.server}</div>}
        
        <div className="options">
          <label className="checkbox-label">
            <input type="checkbox" /> Запомнить меня
          </label>
          <a href="#" className="forgot-link">Забыли пароль?</a>
        </div>

        <button type="submit" className="login-btn">Войти в систему</button>
      </form>
      
      <hr className="divider" />

      <div className="demo-box">
        <strong>Демо-доступ</strong><br />
        <span>Email: demo1@company.ru</span><br />
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
  const [userName, setUserName] = React.useState('');
  const location = useLocation();

  React.useEffect(() => {
    //всего файлов
    axios.get('http://localhost:3001/documents')
      .then(response => {
        setDocuments(response.data);
      })
      .catch(err => console.error("Ошибка загрузки документов:", err));

    //Количество индексированных файлов
    axios.get("http://localhost:3001/index_jobs")
      .then(response => {
        setIndexJobs(response.data);
      })
      .catch(err => console.error(err));

    //Запросы за сегодня
    axios.get("http://localhost:3001/search_queries")
    .then(response => {
      setSearchQueries(response.data);
    })
    .catch(err => console.error("Ошибка загрузки поисковых запросов:", err));

    //Имя
    let currentName = location.state?.user?.full_name;

    if (currentName) {
      setUserName(currentName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('userFullName', currentName);
      }
    } else if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userFullName');
      if (storedName) {
        setUserName(storedName);
      }
    }

  }, [location.state]);

  //Количество документов
  const newDocsCount = documents.filter(doc => {
    const docDate = new Date(doc.created_at);
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return docDate > dayAgo;
  }).length;
  
  //Количество индексированных док-ов
  const recentJobsCount = indexJobs.filter(job => {
  const jobDate = new Date(job.created_at);
  const dayAgo = new Date();
  dayAgo.setDate(dayAgo.getDate() - 1);
  return jobDate > dayAgo;
}).length;

  const indexedDocs = documents.filter(doc => doc.status === "indexed").length;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const jobsToday = searchQueries.filter(q => new Date(q.created_at) >= todayStart).length;

  const jobsYesterday = searchQueries.filter(q => {
    const d = new Date(q.created_at);
    return d >= yesterdayStart && d < todayStart;
  }).length;

  let jobDiffPercent = 0;
  if (jobsYesterday > 0) {
    jobDiffPercent = Math.round(((jobsToday - jobsYesterday) / jobsYesterday) * 100);
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
        <Link to="/search" className='nav-link'><div><i className="fa fa-search" /> Поиск</div></Link>
        <Link to="/collections" className='nav-link'><div><i className="fa fa-folder-open" /> Архив документов</div></Link>
        <Link to="/history" className='nav-link'><div><i className="fa fa-history" /> История запросов</div></Link>
        <Link to="/analytics" className='nav-link'><div><i className="fa fa-line-chart" /> Аналитика</div></Link>
        <Link to="/indexing" className='nav-link'><div><i className="fa fa-database" />Индексация</div></Link>

        <div className="sidebar-divider" />
        <div className="nav-link"><i className="fa fa-cog" /> Настройки</div>
        <div className="logout"><i className="fa fa-sign-out" /><Link to="/" className='exit'> Выход</Link></div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top-row">
            <div className="search-wrapper">
              <i className="fa fa-search" />
              <input type="text" className="search-bar" placeholder="Быстрый поиск..." />
            </div>

            <div className="user-section">
              <div className="header-action-icons">
                <div className="action-btn green-text"><i className="fa fa-upload" /></div>
                <div className="action-btn"><i className="fa fa-bell" /></div>
              </div>
              <div className="vertical-line" />
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-name">{userName || 'Пользователь'}</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar"><i className="fa fa-user-circle" /></div>
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
            <span className={jobDiffPercent >= 0 ? "trend-up-request" : "trend-down"}>{jobDiffPercent >= 0 ? `+${jobDiffPercent}` : jobDiffPercent}%</span>
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
            <div className="activity-item">Договоры на ремонт <span className="trend-up-request">+12%</span></div>
            <div className="activity-item">Сметы и расчеты <span className="trend-up-request">+7%</span></div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Быстрый доступ к коллекциям</h3>
              <i className="fa fa-th panel-header-icon orange" />
            </div>
            
            <button className="Collection">
              Архив 2024 <span className="label orange">Готово</span>
            </button>
            
            <button className="Collection" >
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
  const [userName, setUserName] = React.useState('');
  const location = useLocation();
  React.useEffect(() => {
    //Имя
    let currentName = location.state?.user?.full_name;

    if (currentName) {
      setUserName(currentName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('userFullName', currentName);
      }
    } else if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userFullName');
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

        <Link to="/home" className='nav-link'><div><i className="fa fa-home" /> Главная</div></Link>
        <div className="nav-link active"><i className="fa fa-search" /> Поиск</div>
        <Link to="/collections" className='nav-link'><div><i className="fa fa-folder-open" /> Архив документов</div></Link>
        <Link to="/history" className='nav-link'><div><i className="fa fa-history" /> История запросов</div></Link>
        <Link to="/analytics" className='nav-link'><div><i className="fa fa-line-chart" /> Аналитика</div></Link>
        <Link to="/indexing" className='nav-link'><div><i className="fa fa-database" />Индексация</div></Link>

        <div className="sidebar-divider" />
        <Link to="/settings" className='nav-link'><div><i className="fa fa-cog" /> Настройки</div></Link>
        <div className="logout"><i className="fa fa-sign-out" /><Link to="/" className='exit'> Выход</Link></div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top-row">
            <div className="search-wrapper">
              <i className="fa fa-search" />
              <input type="text" className="search-bar" placeholder="Быстрый поиск..." />
            </div>

            <div className="user-section">
              <div className="header-action-icons">
                <div className="action-btn green-text"><i className="fa fa-upload" /></div>
                <div className="action-btn"><i className="fa fa-bell" /></div>
              </div>
              <div className="vertical-line" />
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-name">{userName || 'Пользователь'}</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar"><i className="fa fa-user-circle" /></div>
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
            <p className="hero-subtitle">Задавайте вопросы на естественном языке и получайте точные ответы с цитатами</p>
          </div>

          <div className="ai-search-container">
            <div className="ai-search-box">
              <i className="fa fa-search search-icon-main"></i>
              <input type="text" placeholder="Введите запрос" className="ai-input" />
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
                <select className="filter-select"><option>Все</option></select>
              </div>
              <div className="filter-item">
                <label>Период</label>
                <select className="filter-select"><option>Все время</option></select>
              </div>
              <div className="filter-item">
                <label>Источник</label>
                <select className="filter-select"><option>Все</option></select>
              </div>
              <div className="filter-item">
                <label>Подразделение</label>
                <select className="filter-select"><option>Все</option></select>
              </div>
              <div className="filter-item">
                <label>Формат</label>
                <select className="filter-select"><option>Все</option></select>
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
      </main>
    </div>
  )
}

// СТРАНИЦА АРХИИВА

const CollectionPage = () => {
  const [userName, setUserName] = React.useState('');
  const location = useLocation();
  React.useEffect(() => {
    //Имя
    let currentName = location.state?.user?.full_name;

    if (currentName) {
      setUserName(currentName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('userFullName', currentName);
      }
    } else if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userFullName');
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

        <Link to="/home" className='nav-link'><div><i className="fa fa-home" /> Главная</div></Link>
        <Link to="/search" className='nav-link'><div><i className="fa fa-search" /> Поиск</div></Link>
        <div className="nav-link active"><i className="fa fa-folder-open" /> Архив документов</div>
        <Link to="/history" className='nav-link'><div><i className="fa fa-history" /> История запросов</div></Link>
        <Link to="/analytics" className='nav-link'><div><i className="fa fa-line-chart" /> Аналитика</div></Link>
        <Link to="/indexing" className='nav-link'><div><i className="fa fa-database" />Индексация</div></Link>

        <div className="sidebar-divider" />
        <Link to="/settings" className='nav-link'><div><i className="fa fa-cog" /> Настройки</div></Link>
        <div className="logout"><i className="fa fa-sign-out" /><Link to="/" className='exit'> Выход</Link></div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top-row">
            <div className="search-wrapper">
              <i className="fa fa-search" />
              <input type="text" className="search-bar" placeholder="Быстрый поиск..." />
            </div>

            <div className="user-section">
              <div className="header-action-icons">
                <div className="action-btn green-text"><i className="fa fa-upload" /></div>
                <div className="action-btn"><i className="fa fa-bell" /></div>
              </div>
              <div className="vertical-line" />
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-name">{userName || 'Пользователь'}</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar"><i className="fa fa-user-circle" /></div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
      {/* Дальше код писать сюда */}
      </main>
    </div>
  )
}

// СТРАНИЦА ИСТОРИИ ЗАПРОСОВ

const HistoryPage = () => {
  const [userName, setUserName] = React.useState('');
  const location = useLocation();
  React.useEffect(() => {
    //Имя
    let currentName = location.state?.user?.full_name;

    if (currentName) {
      setUserName(currentName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('userFullName', currentName);
      }
    } else if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userFullName');
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

        <Link to="/home" className='nav-link'><div><i className="fa fa-home" /> Главная</div></Link>
        <Link to="/search" className='nav-link'><div><i className="fa fa-search" /> Поиск</div></Link>
        <Link to="/collections" className='nav-link'><div><i className="fa fa-folder-open" /> Архив документов</div></Link>
        <div className='nav-link active'><i className="fa fa-history" /> История запросов</div>
        <Link to="/analytics" className='nav-link'><div><i className="fa fa-line-chart" /> Аналитика</div></Link>
        <Link to="/indexing" className='nav-link'><div><i className="fa fa-database" />Индексация</div></Link>

        <div className="sidebar-divider" />
        <Link to="/settings" className='nav-link'><div><i className="fa fa-cog" /> Настройки</div></Link>
        <div className="logout"><i className="fa fa-sign-out" /><Link to="/" className='exit'> Выход</Link></div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top-row">
            <div className="search-wrapper">
              <i className="fa fa-search" />
              <input type="text" className="search-bar" placeholder="Быстрый поиск..." />
            </div>

            <div className="user-section">
              <div className="header-action-icons">
                <div className="action-btn green-text"><i className="fa fa-upload" /></div>
                <div className="action-btn"><i className="fa fa-bell" /></div>
              </div>
              <div className="vertical-line" />
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-name">{userName || 'Пользователь'}</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar"><i className="fa fa-user-circle" /></div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
      {/* Дальше код писать сюда */}
      </main>
    </div>
  )
}

// СТРАНИЦА АНАЛИТИКИ

const AnalyticsPage = () => {
  const [userName, setUserName] = React.useState('');
  const location = useLocation();
  React.useEffect(() => {
    //Имя
    let currentName = location.state?.user?.full_name;

    if (currentName) {
      setUserName(currentName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('userFullName', currentName);
      }
    } else if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userFullName');
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

        <Link to="/home" className='nav-link'><div><i className="fa fa-home" /> Главная</div></Link>
        <Link to="/search" className='nav-link'><div><i className="fa fa-search" /> Поиск</div></Link>
        <Link to="/collections" className='nav-link'><div><i className="fa fa-folder-open" /> Архив документов</div></Link>
        <Link to="/history" className='nav-link'><div><i className="fa fa-history" /> История запросов</div></Link>
        <div className='nav-link active'><i className="fa fa-line-chart" /> Аналитика</div>
        <Link to="/indexing" className='nav-link'><div><i className="fa fa-database" />Индексация</div></Link>

        <div className="sidebar-divider" />
        <Link to="/settings" className='nav-link'><div><i className="fa fa-cog" /> Настройки</div></Link>
        <div className="logout"><i className="fa fa-sign-out" /><Link to="/" className='exit'> Выход</Link></div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top-row">
            <div className="search-wrapper">
              <i className="fa fa-search" />
              <input type="text" className="search-bar" placeholder="Быстрый поиск..." />
            </div>

            <div className="user-section">
              <div className="header-action-icons">
                <div className="action-btn green-text"><i className="fa fa-upload" /></div>
                <div className="action-btn"><i className="fa fa-bell" /></div>
              </div>
              <div className="vertical-line" />
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-name">{userName || 'Пользователь'}</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar"><i className="fa fa-user-circle" /></div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
      {/* Дальше код писать сюда */}
      </main>
    </div>
  )
}

// СТРАНИЦА ИНДЕКСАЦИИ

const IndexingPage = () => {
  const [userName, setUserName] = React.useState('');
  const location = useLocation();
  React.useEffect(() => {
    //Имя
    let currentName = location.state?.user?.full_name;

    if (currentName) {
      setUserName(currentName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('userFullName', currentName);
      }
    } else if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userFullName');
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

        <Link to="/home" className='nav-link'><div><i className="fa fa-home" /> Главная</div></Link>
        <Link to="/search" className='nav-link'><div><i className="fa fa-search" /> Поиск</div></Link>
        <Link to="/collections" className='nav-link'><div><i className="fa fa-folder-open" /> Архив документов</div></Link>
        <Link to="/history" className='nav-link'><div><i className="fa fa-history" /> История запросов</div></Link>
        <Link to="/analytics" className='nav-link'><div><i className="fa fa-line-chart" /> Аналитика</div></Link>
        <div className='nav-link active'><i className="fa fa-database" />Индексация</div>

        <div className="sidebar-divider" />
        <Link to="/settings" className='nav-link'><div><i className="fa fa-cog" /> Настройки</div></Link>
        <div className="logout"><i className="fa fa-sign-out" /><Link to="/" className='exit'> Выход</Link></div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top-row">
            <div className="search-wrapper">
              <i className="fa fa-search" />
              <input type="text" className="search-bar" placeholder="Быстрый поиск..." />
            </div>

            <div className="user-section">
              <div className="header-action-icons">
                <div className="action-btn green-text"><i className="fa fa-upload" /></div>
                <div className="action-btn"><i className="fa fa-bell" /></div>
              </div>
              <div className="vertical-line" />
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-name">{userName || 'Пользователь'}</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar"><i className="fa fa-user-circle" /></div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
      {/* Дальше код писать сюда */}
      </main>
    </div>
  )
}

// СТРАНИЦА НАСТРОЕК!!!

const SettingsPage = () => {
  const [userName, setUserName] = React.useState('');
  const location = useLocation();
  React.useEffect(() => {
    //Имя
    let currentName = location.state?.user?.full_name;

    if (currentName) {
      setUserName(currentName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('userFullName', currentName);
      }
    } else if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userFullName');
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

        <Link to="/home" className='nav-link'><div><i className="fa fa-home" /> Главная</div></Link>
        <Link to="/search" className='nav-link'><div><i className="fa fa-search" /> Поиск</div></Link>
        <Link to="/collections" className='nav-link'><div><i className="fa fa-folder-open" /> Архив документов</div></Link>
        <Link to="/history" className='nav-link'><div><i className="fa fa-history" /> История запросов</div></Link>
        <Link to="/analytics" className='nav-link'><div><i className="fa fa-line-chart" /> Аналитика</div></Link>
        <Link to="/indexing" className="nav-link "><div><i className="fa fa-database" />Индексация</div></Link>

        <div className="sidebar-divider" />
        <div className="nav-link active"><i className="fa fa-cog" /> Настройки</div>
        <div className="logout"><i className="fa fa-sign-out" /><Link to="/" className='exit'> Выход</Link></div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top-row">
            <div className="search-wrapper">
              <i className="fa fa-search" />
              <input type="text" className="search-bar" placeholder="Быстрый поиск..." />
            </div>

            <div className="user-section">
              <div className="header-action-icons">
                <div className="action-btn green-text"><i className="fa fa-upload" /></div>
                <div className="action-btn"><i className="fa fa-bell" /></div>
              </div>
              <div className="vertical-line" />
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-name">{userName || 'Пользователь'}</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar"><i className="fa fa-user-circle" /></div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
      {/* Дальше код писать сюда */}
      </main>
    </div>
  )
}


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