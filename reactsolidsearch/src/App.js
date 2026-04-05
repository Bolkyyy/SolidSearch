import React from 'react';
import { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import logo from './Images/BlackLogo.svg';
import axios from 'axios';

//СТРАНИЦА ЛОГИНА - МАРТЫНОВ

const LoginPage = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '300px' }}>
      <h2>Вход в систему</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="text" placeholder="Логин" style={{ display: 'block', marginBottom: '10px' }} />
        <input type="password" placeholder="Пароль" style={{ display: 'block', marginBottom: '10px' }} />
        <Link to="/home"><button type="submit">Войти</button></Link>
      </form>
    </div>
  );
};

//ГЛАВНАЯ

const HomePage = () => {
  const [documents, setDocuments] = React.useState([]); // Состояние для массива документов

  React.useEffect(() => {
    axios.get('http://localhost:3001/documents') 
      .then(response => {
        setDocuments(response.data); // Кладем массив из БД в состояние
      })
      .catch(err => console.error("Ошибка загрузки документов:", err));
  }, []);  
  
  const newDocsCount = documents.filter(doc => {
    const docDate = new Date(doc.created_at); // Дата создания документа
    const dayAgo = new Date(); 
    dayAgo.setDate(dayAgo.getDate() - 1); // Время ровно 24 часа назад

    return docDate > dayAgo; // Оставляем только те, что созданы позже, чем вчера
  }).length;

  const indexedDocs = documents.filter(doc => doc.status === "indexed");

  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={logo} className="logo-img"></img>
          <span className="logo-text">AI-поиск по документам</span>
        </div>
        
        <div className="nav-link active"><i className="fa fa-home" /> Главная</div>
        <div className="nav-link"><i className="fa fa-search" /> Поиск</div>
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
                  <div className="user-post">Должность</div>
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
            <span className="trend-up">{newDocsCount > 0 ? `+ ${newDocsCount}` : `+0`}</span>
          </div>
          <div className="stat-card">
            <i className="fa fa-check-circle card-icon green" />
            <p>Проиндексировано</p>
            <h2>{indexedDocs.length}</h2>
            <span className="trend-up-index">+856</span>
          </div>
          <div className="stat-card">
            <i className="fa fa-bolt card-icon purple" />
            <p>Запросов сегодня</p>
            <h2>1,456</h2>
            <span className="trend-up-request">+12%</span>
          </div>
          <div className="stat-card">
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
            <div className="activity-item"><span>Иван Петров: Поиск...</span><span className="time">2 мин назад</span></div>
            <div className="activity-item"><span>Мария Сидорова: Открыт...</span><span className="time">15 мин назад</span></div>
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
            <div className="Collection">Архив 2024 <span className="label orange">Готово</span></div>
            <div className="Collection">Текущие проекты <span className="label orange">Индексация</span></div>
            <div className="view-all-bottom">Все коллекции →</div>
          </div>
        </div>
      </main>
    </div>
  )
}


function App() {
  return (
    <Router>
      {/* Область, где контент будет подменяться */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
