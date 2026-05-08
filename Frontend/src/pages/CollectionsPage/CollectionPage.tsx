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

  return (
    <Layout>
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
            <div className="stat-value blue">{totalDocuments}</div>
            <div className="stat-label">Всего документов</div>
          </div>
          <div className="stat-card-archive">
            <div className="stat-value purple">{totalIndexed}</div>
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
              <Link to="/indexing" className="btn-reindex">
                <button className="indbtn">Переиндексировать</button>
              </Link>
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
              <Link to="/indexing" className="btn-reindex">
                <button className="indbtn">Переиндексировать</button>
              </Link>
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
              <Link to="/indexing" className="btn-reindex">
                <button className="indbtn">Переиндексировать</button>
              </Link>
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
              <Link to="/indexing" className="btn-reindex">
                <button className="indbtn">Переиндексировать</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CollectionPage;
