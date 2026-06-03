import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout/Layout";
import { fetchDashboardData, DashboardData } from "@/api/dashboard";
import { usersApi, User } from "@/api/Users";

interface Collection {
  id: number;
  name: string;
  is_active: boolean;
}

interface ActivityItem {
  id: number;
  user_id: number;
  query_text: string;
  query_type: string;
  result_count: number | null;
  created_at: string;
}

const BASE = "http://localhost:3001";

const relativeTime = (dateStr: string): string => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`;
  return new Date(dateStr).toLocaleDateString("ru-RU");
};

const HomePage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [users, setUsers] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch(() => {});

    axios
      .get(`${BASE}/document_collection`)
      .then((res) => setCollections(res.data))
      .catch(() => {});

    axios
      .get(`${BASE}/history/recent?limit=4`)
      .then((res) => setActivity(res.data as ActivityItem[]))
      .catch(() => {});

    usersApi
      .getUsers()
      .then((list: User[]) => {
        const map: Record<number, string> = {};
        for (const u of list) map[u.id] = u.full_name;
        setUsers(map);
      })
      .catch(() => {});
  }, []);

  const totalDocuments = data?.totalDocuments ?? 0;
  const totalDocumentsToday = data?.totalDocumentsToday ?? 0;
  const totalIndexed = data?.totalIndexed ?? 0;
  const totalIndexedToday = data?.totalIndexed ?? 0;
  const totalSearch = data?.totalSearch ?? 0;
  const totalSearchToday = data?.totalSearchToday ?? 0;

  const previewCollections = collections.slice(0, 4);

  return (
    <Layout>
      <section className="welcome">
        <h1>Добро пожаловать!</h1>
        <p className="welcome-link">Обзор активности и статистика системы</p>
      </section>

      <div className="stats-grid">
        <div className="stat-card-blue">
          <i className="fa fa-file-text card-icon blue" />
          <p>Всего документов</p>
          <h2>{totalDocuments}</h2>
          <span className="trend-up">+{totalDocumentsToday}</span>
        </div>
        <div className="stat-card-green">
          <i className="fa fa-check-circle card-icon green" />
          <p>Проиндексировано</p>
          <h2>{totalIndexed}</h2>
          <span className="trend-up-index">+{totalIndexedToday}</span>
        </div>
        <div className="stat-card-viol">
          <i className="fa fa-bolt card-icon purple" />
          <p>Запросов сегодня</p>
          <h2>{totalSearch}</h2>
          <span
            className={
              totalSearchToday >= 0 ? "trend-up-request" : "trend-down"
            }
          >
            {totalSearchToday >= 0 ? `+${totalSearchToday}` : totalSearchToday}%
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

          {activity.length === 0 ? (
            <div className="activity-empty">
              <i className="fa fa-inbox" />
              <span>Активности пока нет</span>
            </div>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="activity-item multi-line">
                <div className="activity-row">
                  <span className="user-name-small">
                    {users[item.user_id] ?? `Пользователь ${item.user_id}`}
                  </span>
                  <span className="time">{relativeTime(item.created_at)}</span>
                </div>
                <div className="activity-row">
                  <span className="search-query" title={item.query_text}>
                    {item.query_type === "ai" ? (
                      <>
                        <i className="fa fa-search" style={{ marginRight: 4}}/>
                        Поиск: "
                      </>
                    ) : (
                      <>
                        <i
                          className="fa fa-search"
                          style={{ marginRight: 4, color: "#60a5fa" }}
                        />
                        Поиск: "
                      </>
                    )}
                    {item.query_text.length > 28
                      ? item.query_text.slice(0, 28) + "…"
                      : item.query_text}
                    "
                  </span>
                  {item.result_count != null && (
                    <span className="results-count">
                      {item.result_count} рез.
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
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
            <h3>Быстрый доступ</h3>
            <i className="fa fa-th panel-header-icon orange" />
          </div>

          {previewCollections.length === 0 ? (
            <div className="quick-collections-empty">
              <i className="fa fa-folder-open" />
              <span>Коллекций пока нет</span>
            </div>
          ) : (
            previewCollections.map((col) => (
              <Link
                key={col.id}
                to={`/collection/${col.id}`}
                className="quick-collection-item"
              >
                <i className="fa fa-folder" />
                <span className="quick-collection-name">{col.name}</span>
                <i className="fa fa-chevron-right quick-collection-arrow" />
              </Link>
            ))
          )}

          <div className="quick-collections-footer">
            <Link to="/collections" className="view-all-bottom">
              Все коллекции →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
