import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <aside className="sidebar">
        <div className="logo">Solid<span>search</span></div>
        <div className="nav-link active"><i class="fa fa-home" aria-hidden="true"></i> Главная</div>
        <div className="nav-link"><i class="fa fa-search" aria-hidden="true"></i> Поиск</div>
        <div className="nav-link"><i class="fa fa-archive" aria-hidden="true"></i> Архив документов</div>
        <div className="nav-link"><i class="fa fa-history" aria-hidden="true"></i> История запросов</div>
        <div className="nav-link"><i class="fa fa-line-chart" aria-hidden="true"></i> Аналитика</div>
        <div className="nav-link"><i class="fa fa-cog" aria-hidden="true"></i> Настройки</div>
        <div className="logout"><i class="fa fa-sign-out" aria-hidden="true"></i> Выход</div>
      </aside>

      <main className="main-content">
        <div className="header">
          <input type="text" className="search-bar" placeholder="Быстрый поиск..." />
          <div className="user">Имя Фамилия <i class="fa fa-user" aria-hidden="true"></i></div>
        </div>

        <section className="welcome">
          <h1>Добро пожаловать!</h1>
          <p style={{color: '#888'}}>Обзор активности и статистика системы</p>
        </section>

        <div className="stats-grid">
          <div className="stat-card">
            <p>Всего документов</p>
            <h2>24,587</h2>
            <span className="trend-up">+1,234</span>
          </div>
          <div className="stat-card">
            <p>Проиндексировано</p>
            <h2>23,892</h2>
            <span className="trend-up">+856</span>
          </div>
          <div className="stat-card">
            <p>Запросов сегодня</p>
            <h2>1,456</h2>
            <span className="trend-up">+12%</span>
          </div>
          <div className="stat-card">
            <p>Среднее время отчета</p>
            <h2>1.2 сек</h2>
            <span className="trend-down">-0.2 сек</span>
          </div>
        </div>

        <div className="bottom-sections">
          <div className="panel">
            <h3>Последняя активность</h3>
            <div className="activity-item">
              <span>Иван Петров: Поиск договора...</span>
              <span style={{color: '#666'}}>2 мин назад</span>
            </div>
            <div className="activity-item">
              <span>Система: Индексация завершена</span>
              <span style={{color: '#666'}}>1 час назад</span>
            </div>
          </div>

          <div className="panel">
            <h3>Популярные темы</h3>
            <div className="activity-item">Договоры на ремонт <span className="trend-up">+12%</span></div>
            <div className="activity-item">Сметы и расчеты <span className="trend-up">+7%</span></div>
          </div>

          <div className="panel">
            <h3>Быстрый доступ</h3>
            <p><i class="fa fa-folder" aria-hidden="true"></i> Архив 2024</p>
            <p><i class="fa fa-folder" aria-hidden="true"></i> Текущие проекты</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;