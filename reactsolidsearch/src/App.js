import React from 'react';
import { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import logo from './Images/BlackLogo.svg';
import axios from 'axios';


//СТРАНИЦА ЛОГИНА - МАРТЫНОВ

const LoginPage = () => {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1d1d1d',  // Светло-серый фон как на фото
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#2D2D2D',  // Белая карточка
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        width: '380px'
      }}>
        {/* ЛОГО */}
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold',
          marginBottom: '8px',
          marginTop: 0,
          color: '#000000'  // Черный цвет
        }}>Solid Search</h1>
        
        <p style={{ 
          fontSize: '14px', 
          color: '#666666',  // Серый для подзаголовка
          marginBottom: '32px'
        }}>AI-powered система поиска и аналитики документов</p>
        
        <h2 style={{ 
          fontSize: '20px', 
          marginBottom: '20px',
          fontWeight: 'bold',
          color: '#000000'  // Черный
        }}>Вход в систему</h2>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: 'bold',
              marginBottom: '6px',
              fontSize: '14px',
              color: '#000000'  // Черный
            }}>Email</label>
            <input 
              type="email" 
              defaultValue="example@company.com"
              style={{ 
                width: '100%', 
                padding: '8px 10px',
                border: '1px solid #cccccc',  // Светло-серая рамка
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
                color: '#000000'
              }} 
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: 'bold',
              marginBottom: '6px',
              fontSize: '14px',
              color: '#000000'
            }}>Пароль</label>
            <input 
              type="password" 
              defaultValue="********"
              style={{ 
                width: '100%', 
                padding: '8px 10px',
                border: '1px solid #cccccc',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }} 
            />
          </div>
          
          <div style={{ 
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#000000' }}>
              <input type="checkbox" style={{ marginRight: '6px' }} /> 
              Запомнить меня
            </label>
            <a href="#" style={{ color: '#0066cc', textDecoration: 'none' }}>Забыли пароль?</a>
          </div>
          
          <Link to="/home">
            <button 
              type="submit" 
              style={{ 
                width: '100%',
                padding: '10px',
                backgroundColor: '#007bff',  // Синяя кнопка
                color: '#ffffff',  // Белый текст
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '30px'
              }}
            >
              Войти в систему
            </button>
          </Link>
        </form>
        
        <div style={{ marginBottom: '20px' }}>
          <strong style={{ fontSize: '14px', color: '#000000' }}>Демо-доступ</strong><br />
          <span style={{ fontSize: '13px', color: '#555555' }}>
            Email: demo@company.ru<br />
            Пароль: demo123
          </span>
        </div>
        
        <hr style={{ border: 'none', borderTop: '1px solid #eeeeee', marginBottom: '15px' }} />
        
        <p style={{ 
          fontSize: '12px', 
          color: '#999999',  // Светло-серый для копирайта
          textAlign: 'center',
          margin: 0
        }}>© 2026 Интеллектуальный архив. Все права защищены.</p>
      </div>
    </div>
  );
};
//ГЛАВНАЯЯ

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

/* страница логина */