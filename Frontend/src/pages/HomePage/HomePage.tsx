import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { fetchDashboardData, DashboardData } from "@/api/dashboard";
import { usersApi, User } from "@/api/Users";
import { collectionsApi, Collection } from "@/api/collectionsApi";
import { documentsApi, Document as Doc } from "@/api/documentsApi";
import { historyApi, RecentActivityItem } from "@/api/historyApi";

const EXT_COLOR: Record<string, string> = {
  PDF: "#ef4444",
  DOCX: "#3b82f6",
  DOC: "#3b82f6",
  TXT: "#a0a0a0",
  MD: "#a0a0a0",
  MARKDOWN: "#a0a0a0",
  XLSX: "#10b981",
  XLS: "#10b981",
  ODS: "#10b981",
  CSV: "#f59e0b",
  PPTX: "#f97316",
  PPT: "#f97316",
  RTF: "#8b5cf6",
  PNG: "#06b6d4",
  JPG: "#06b6d4",
  JPEG: "#06b6d4",
  TIFF: "#06b6d4",
  TIF: "#06b6d4",
  WEBP: "#06b6d4",
};

const parseServerDate = (s: string): Date => {
  const raw = s
    .trim()
    .replace(" ", "T")
    .replace(/(\.\d{3})\d+/, "$1");
  const normalized = /[Zz]$|[+-]\d{2}:?\d{2}$/.test(raw) ? raw : raw + "Z";
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? new Date(0) : d;
};

const relativeTime = (dateStr: string): string => {
  const diff = Math.floor(
    (Date.now() - parseServerDate(dateStr).getTime() - 3 * 3600 * 1000) / 1000,
  );
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`;
  return parseServerDate(dateStr).toLocaleDateString("ru-RU");
};

const HomePage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [recentDocs, setRecentDocs] = useState<Doc[]>([]);
  const [users, setUsers] = useState<Record<number, string>>({});

  useEffect(() => {
    const loadDashboard = () =>
      fetchDashboardData()
        .then(setData)
        .catch(() => {});
    const loadRecentDocs = () =>
      documentsApi.getRecent(4)
        .then(setRecentDocs)
        .catch(() => {});
    const loadActivity = () =>
      historyApi
        .getRecent(4)
        .then(setActivity)
        .catch(() => {});

    loadDashboard();
    loadRecentDocs();
    loadActivity();

    const interval = setInterval(() => {
      loadDashboard();
      loadRecentDocs();
      loadActivity();
    }, 15_000);

    collectionsApi
      .getAll()
      .then(setCollections)
      .catch(() => {});

    usersApi
      .getUsers()
      .then((list: User[]) => {
        const map: Record<number, string> = {};
        for (const u of list) map[u.id] = u.full_name;
        setUsers(map);
      })
      .catch(() => {});

    return () => clearInterval(interval);
  }, []);

  const totalDocuments = data?.totalDocuments ?? 0;
  const totalDocumentsToday = data?.totalDocumentsToday ?? 0;
  const totalIndexed = data?.totalIndexed ?? 0;
  const totalIndexedToday = data?.totalIndexedToday ?? 0;
  const totalSearchToday = data?.totalSearchToday ?? 0;
  const totalSearchYesterday = data?.totalSearchYesterday ?? 0;
  const searchTrend =
    totalSearchYesterday > 0
      ? Math.round(
          ((totalSearchToday - totalSearchYesterday) / totalSearchYesterday) *
            100,
        )
      : totalSearchToday > 0
        ? Infinity
        : null;
  const avgResponseTimeSec = data?.avgResponseTimeSec ?? null;
  const avgResponseTimeSecYesterday = data?.avgResponseTimeSecYesterday ?? null;
  const avgTimeDelta =
    avgResponseTimeSec != null && avgResponseTimeSecYesterday != null
      ? +(avgResponseTimeSec - avgResponseTimeSecYesterday).toFixed(1)
      : null;

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
          <h2>{totalSearchToday}</h2>
          {searchTrend !== null && (
            <span className="trend-up-request">
              {searchTrend === Infinity
                ? `+${totalSearchToday} за сегодня`
                : `${searchTrend >= 0 ? "+" : ""}${searchTrend}%`}
            </span>
          )}
        </div>
        <div className="stat-card-orange">
          <i className="fa fa-history card-icon orange" />
          <p>Среднее время отчета</p>
          <h2>
            {avgResponseTimeSec != null
              ? `${avgResponseTimeSec.toFixed(1)} сек`
              : "—"}
          </h2>
          {avgTimeDelta !== null && (
            <span className="trend-down">
              {avgTimeDelta > 0 ? `+${avgTimeDelta}` : avgTimeDelta} сек
            </span>
          )}
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
                        <i className="fa fa-search activity-icon" />
                        Поиск: "
                      </>
                    ) : (
                      <>
                        <i className="fa fa-search activity-icon activity-icon--blue" />
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
            <h3>Последние загруженные документы</h3>
            <i className="fa fa-file-text panel-header-icon purple" />
          </div>
          {recentDocs.length === 0 ? (
            <div className="activity-empty">
              <i className="fa fa-inbox" />
              <span>Документов пока нет</span>
            </div>
          ) : (
            recentDocs.map((doc) => {
              const color = EXT_COLOR[doc.document_type] ?? "#555";
              const statusIcon =
                doc.status === "processed" ? (
                  <i
                    className="fa fa-check-circle"
                    style={{ color: "#10b981", fontSize: 12, flexShrink: 0 }}
                  />
                ) : doc.status === "error" ? (
                  <i
                    className="fa fa-exclamation-circle"
                    style={{ color: "#ef4444", fontSize: 12, flexShrink: 0 }}
                  />
                ) : (
                  <i
                    className="fa fa-spinner fa-spin"
                    style={{ color: "#f59e0b", fontSize: 12, flexShrink: 0 }}
                  />
                );
              return (
                <Link
                  key={doc.id}
                  to={`/document/${doc.id}`}
                  className="recent-doc-item"
                >
                  <div
                    className="recent-doc-icon-wrap"
                    style={{
                      background: color,
                      color: "#fff",
                      boxShadow: `0 0 8px ${color}88`,
                      border: "none",
                    }}
                  >
                    {doc.document_type || "?"}
                  </div>
                  <div className="recent-doc-body">
                    <span className="recent-doc-title" title={doc.title}>
                      {doc.title.length > 28
                        ? doc.title.slice(0, 28) + "…"
                        : doc.title}
                    </span>
                    <span className="recent-doc-sub">
                      {doc.document_type} · {relativeTime(doc.created_at)}
                    </span>
                  </div>
                  {statusIcon}
                </Link>
              );
            })
          )}
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
