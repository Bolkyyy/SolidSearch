import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout/Layout';

interface Document {
  id: number;
  created_at: string;
  status: string;
}

interface IndexJob {
  id: number;
  created_at: string;
}

interface SearchQuery {
  id: number;
  created_at: string;
}

const HomePage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [indexJobs, setIndexJobs] = useState<IndexJob[]>([]);
  const [searchQueries, setSearchQueries] = useState<SearchQuery[]>([]);
  const location = useLocation();

  return (
    <Layout>
      <section className="welcome">
        <h1>Добро пожаловать!</h1>
        <p className="welcome-link">Обзор активности и статистика системы</p>
      </section>

      <div className="stats-grid">
        <div className="stat-card">
          <i className="fa fa-file-text card-icon blue" />
          <p>Всего документов</p>
          <h2>{documents.length}</h2>
          <span className="trend-up">+{/*newDocsCount*/}</span>
        </div>
        <div className="stat-card-green">
          <i className="fa fa-check-circle card-icon green" />
          <p>Проиндексировано</p>
          <h2>{/*indexedDocs*/}</h2>
          <span className="trend-up-index">+{/*recentJobsCount*/}</span>
        </div>
        <div className="stat-card-viol">
          <i className="fa fa-bolt card-icon purple" />
          <p>Запросов сегодня</p>
          <h2>{/*jobsToday*/}</h2>
          <span className={/*jobDiffPercent >= 0 ? 'trend-up-request' :*/ 'trend-down'}>
            {/*jobDiffPercent >= 0 ? `+${jobDiffPercent}` : jobDiffPercent*/}%
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
          <div>
            <Link to="/history" className="view-all-history">Вся история →</Link>
          </div>
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
          <div>
            <Link to="/collections" className="view-all-bottom">Все коллекции →</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;