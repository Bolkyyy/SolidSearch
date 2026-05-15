import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { fetchDashboardData, DashboardData } from "@/api/dashboard";

const CollectionPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData().then(setData);
  }, []);

  const totalDocuments = data?.totalDocuments ?? 0;
  const totalIndexed = data?.totalIndexed ?? 0;

  const collections = [
    { name: "Архив 2024", docs: 3245, size: "2.4 ГБ", formats: ["PDF", "DOCX", "TXT"] },
    { name: "Архив 2023", docs: 8134, size: "5.8 ГБ", formats: ["PDF", "DOCX", "TXT"] },
    { name: "Архив 2022", docs: 8120, size: "5.7 ГБ", formats: ["PDF", "DOCX", "TXT"] },
    { name: "Текущие проекты", docs: 456, size: "890 МБ", formats: ["PDF", "DOCX", "TXT", "XLSX"] },
  ];

  return (
    <Layout>
      {/* Шапка как на HomePage (кнопка справа) */}
      <section className="welcome" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Архив документов</h1>
          <p className="welcome-link">Управление коллекциями и архивами документов</p>
        </div>
        <button className="create-collection-btn">
          <i className="fa fa-plus"></i> Создать коллекцию
        </button>
      </section>

      {/* Статистика */}
      <div className="stats-cards">
        <div className="stat-card-archive">
          <i className="fa fa-file-text card-icon blue"></i>
          <p>Всего коллекций</p>
          <h2>{collections.length}</h2>
          <span className="trend-up">+0</span>
        </div>
        <div className="stat-card-archive">
          <i className="fa fa-check-circle card-icon green"></i>
          <p>Всего документов</p>
          <h2>{totalDocuments}</h2>
          <span className="trend-up-index">+{totalDocuments}</span>
        </div>
        <div className="stat-card-archive">
          <i className="fa fa-bolt card-icon purple"></i>
          <p>Проиндексировано</p>
          <h2>{totalIndexed}</h2>
          <span className="trend-up-request">+{totalIndexed}</span>
        </div>
        <div className="stat-card-archive">
          <i className="fa fa-history card-icon orange"></i>
          <p>Требуют внимания</p>
          <h2>1</h2>
          <span className="trend-down">-</span>
        </div>
      </div>

      {/* Сетка коллекций */}
      <div className="archives-grid">
        {collections.map((col, idx) => (
          <div className="archive-item" key={idx}>
            <div className="archive-item-header">
              <i className="fa fa-folder-open" style={{ marginRight: "8px", color: "#f59e0b" }} />
              <h3 style={{ display: "inline-block" }}>{col.name}</h3>
            </div>
            <div className="archive-info">
              <span><i className="fa fa-file-text-o"></i>{col.docs.toLocaleString()} документов</span>
              <div className="file-formats">
                {col.formats.map((fmt) => (
                  <span key={fmt} className={`format-badge format-${fmt.toLowerCase()}`}>
                    {fmt}
                  </span>
                ))}
              </div>
              <span><i className="fa fa-database"></i> {col.size}</span>
            </div>
            <div className="archive-buttons">
              <button className="btn-open"><i className="fa fa-folder-open"></i> Открыть</button>
              <Link to="/indexing" className="btn-reindex"><i className="fa fa-refresh"></i> Переиндексировать</Link>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default CollectionPage;