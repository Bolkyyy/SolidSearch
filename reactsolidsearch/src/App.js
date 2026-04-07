import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import logo from './Images/BlackLogo.svg';
import axios from 'axios';

//СТРАНИЦА ЛОГИНА - МАРТЫНОВ

const LoginPage = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/users/login', {
        email: email,
        password: password
      });

      console.log('Ответ от сервера:', response.data);
      
      navigate('/home');

    } catch (error) {
      console.error('Ошибка при логине:', error);
    }
    
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div class="overlay"></div>
        <div class="theme-toggle"><div class="toggle-circle"></div></div>
        
        <img className='logo' src={logo}></img>
        <p className="subtitle">AI-powered система поиска и аналитики документов</p>
        
        <h2 className="login-title">Вход в систему</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Email</label>
          <input 
            type="email" 
            placeholder="example@company.com" 
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
        </div>
        
        <div className="input-group">
          <label className="input-label">Пароль</label>
          <input 
            type="password" 
            placeholder="*************" 
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
        </div>
        
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
        <span>Email: demo@company.ru</span><br />
        <span>Пароль: demo123</span>
      </div>
      
      <hr className="divider" />
      <p className="footer">© 2026 SolidSearch. Все права защищены.</p>
    </div>
  </div>
  );
};

//ГЛАВНАЯЯ
const HomePage = () => {
  const [documents, setDocuments] = React.useState([]);

  React.useEffect(() => {
    axios.get('http://localhost:3001/documents')
      .then(response => {
        setDocuments(response.data);
      })
      .catch(err => console.error("Ошибка загрузки документов:", err));
  }, []);

  const newDocsCount = documents.filter(doc => {
    const docDate = new Date(doc.created_at);
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return docDate > dayAgo;
  }).length;

  const indexedDocs = documents.filter(doc => doc.status === "indexed").length;

  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">AI-поиск по документам</span>
        </div>

        <div className="nav-link active"><i className="fa fa-home" /> Главная</div>
        <div className="nav-link"><i className="fa fa-search" /> Поиск</div>
        <div className="nav-link"><i className="fa fa-folder-open" /> Архив документов</div>
        <div className="nav-link"><i className="fa fa-history" /> История запросов</div>
        <div className="nav-link"><i className="fa fa-line-chart" /> Аналитика</div>
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
                  <div className="user-name">Имя Фамилия</div>
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
            <span className="trend-up-index">+856</span>
          </div>
          <div className="stat-card-viol">
            <i className="fa fa-bolt card-icon purple" />
            <p>Запросов сегодня</p>
            <h2>1,456</h2>
            <span className="trend-up-request">+12%</span>
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
  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">AI-поиск по документам</span>
        </div>

        <div className="nav-link"><i className="fa fa-home" /> Главная</div>
        <div className="nav-link active"><i className="fa fa-search" /> Поиск</div>
        <div className="nav-link"><i className="fa fa-folder-open" /> Архив документов</div>
        <div className="nav-link"><i className="fa fa-history" /> История запросов</div>
        <div className="nav-link"><i className="fa fa-line-chart" /> Аналитика</div>
        <div className="nav-link"><i className="fa fa-database" /> Индексация</div>

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
                  <div className="user-name">Имя Фамилия</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar"><i className="fa fa-user-circle" /></div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
      </main>
      {/* Дальше код писать сюда */}
    </div>
  )
}

// СТРАНИЦА АРХИИВА

const CollectionPage = () => {
  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">AI-поиск по документам</span>
        </div>

        <div className="nav-link"><i className="fa fa-home" /> Главная</div>
        <div className="nav-link"><i className="fa fa-search" /> Поиск</div>
        <div className="nav-link active"><i className="fa fa-folder-open" /> Архив документов</div>
        <div className="nav-link"><i className="fa fa-history" /> История запросов</div>
        <div className="nav-link"><i className="fa fa-line-chart" /> Аналитика</div>
        <div className="nav-link"><i className="fa fa-database" /> Индексация</div>

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
                  <div className="user-name">Имя Фамилия</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar"><i className="fa fa-user-circle" /></div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
      </main>
      {/* Дальше код писать сюда */}
    </div>
  )
}

// СТРАНИЦА ИСТОРИИ ЗАПРОСОВ

const HistoryPage = () => {
  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">AI-поиск по документам</span>
        </div>

        <div className="nav-link"><i className="fa fa-home" /> Главная</div>
        <div className="nav-link"><i className="fa fa-search" /> Поиск</div>
        <div className="nav-link"><i className="fa fa-folder-open" /> Архив документов</div>
        <div className="nav-link active"><i className="fa fa-history" /> История запросов</div>
        <div className="nav-link"><i className="fa fa-line-chart" /> Аналитика</div>
        <div className="nav-link"><i className="fa fa-database" /> Индексация</div>

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
                  <div className="user-name">Имя Фамилия</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar"><i className="fa fa-user-circle" /></div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
      </main>
      {/* Дальше код писать сюда */}
    </div>
  )
}

// СТРАНИЦА АНАЛИТИКИ

const AnalyticsPage = () => {
  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">AI-поиск по документам</span>
        </div>

        <div className="nav-link"><i className="fa fa-home" /> Главная</div>
        <div className="nav-link"><i className="fa fa-search" /> Поиск</div>
        <div className="nav-link"><i className="fa fa-folder-open" /> Архив документов</div>
        <div className="nav-link"><i className="fa fa-history" /> История запросов</div>
        <div className="nav-link active"><i className="fa fa-line-chart" /> Аналитика</div>
        <div className="nav-link"><i className="fa fa-database" /> Индексация</div>

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
                  <div className="user-name">Имя Фамилия</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar"><i className="fa fa-user-circle" /></div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
      </main>
      {/* Дальше код писать сюда */}
    </div>
  )
}

// СТРАНИЦА ИНДЕКСАЦИИ

const IndexingPage = () => {
  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">AI-поиск по документам</span>
        </div>

        <div className="nav-link"><i className="fa fa-home" /> Главная</div>
        <div className="nav-link"><i className="fa fa-search" /> Поиск</div>
        <div className="nav-link"><i className="fa fa-folder-open" /> Архив документов</div>
        <div className="nav-link"><i className="fa fa-history" /> История запросов</div>
        <div className="nav-link"><i className="fa fa-line-chart" /> Аналитика</div>
        <div className="nav-link active"><i className="fa fa-database" /> Индексация</div>

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
                  <div className="user-name">Имя Фамилия</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar"><i className="fa fa-user-circle" /></div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
      </main>
      {/* Дальше код писать сюда */}
    </div>
  )
}

// СТРАНИЦА НАСТРОЕК!!!

const SettingsPage = () => {
  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img" alt="logo" />
          <span className="logo-text">AI-поиск по документам</span>
        </div>

        <div className="nav-link"><i className="fa fa-home" /> Главная</div>
        <div className="nav-link"><i className="fa fa-search" /> Поиск</div>
        <div className="nav-link"><i className="fa fa-folder-open" /> Архив документов</div>
        <div className="nav-link"><i className="fa fa-history" /> История запросов</div>
        <div className="nav-link"><i className="fa fa-line-chart" /> Аналитика</div>
        <div className="nav-link "><i className="fa fa-database" /><Link to="/indexing ">Индексация</Link></div>

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
                  <div className="user-name">Имя Фамилия</div>
                  <div className="user-post">Разработчик</div>
                </div>
                <div className="user-avatar"><i className="fa fa-user-circle" /></div>
              </div>
            </div>
          </div>
          <div className="header-bottom-line" />
        </header>
      </main>
      {/* Дальше код писать сюда */}
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