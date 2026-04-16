import Layout from '../../components/Layout/Layout';

const IndexingPage = () => {
  return (
    <Layout>
      <section className="welcome">
        <h1>Управление индексацией</h1>
        <p className="welcome-link">Загрузка и индексация новых документов</p>
      </section>
      <div className="indexing-page-content">
        <div className="indexing-stats-grid">
          <div className="stat-card-indexing orange">
            <div className="stat-info">
              <span className="stat-label">В очереди</span>
              <span className="stat-value">1</span>
            </div>
            <i className="fa fa-clock stat-icon"></i>
          </div>
          <div className="stat-card-indexing purple">
            <div className="stat-info">
              <span className="stat-label">Обрабатывается</span>
              <span className="stat-value">2</span>
            </div>
            <i className="fa fa-play-circle stat-icon"></i>
          </div>
          <div className="stat-card-indexing green">
            <div className="stat-info">
              <span className="stat-label">Проиндексировано</span>
              <span className="stat-value">2</span>
            </div>
            <i className="fa fa-check-circle stat-icon"></i>
          </div>
          <div className="stat-card-indexing red">
            <div className="stat-info">
              <span className="stat-label">Ошибки</span>
              <span className="stat-value">1</span>
            </div>
            <i className="fa fa-exclamation-circle stat-icon"></i>
          </div>
        </div>

        <div className="upload-dropzone">
          <div className="upload-icon-circle"><i className="fa fa-upload"></i></div>
          <h3>Загрузите документы для индексации</h3>
          <p>Перетащите файлы сюда или нажмите для выбора</p>
          <div className="upload-buttons">
            <button className="btn-upload-file primary">Выбрать файлы</button>
            <button className="btn-upload-folder primary">Выбрать папку</button>
          </div>
          <span className="upload-hint">Поддерживаемые форматы: PDF, DOCX, TXT, XLSX</span>
        </div>

        <div className="indexing-queue-container">
          <div className="queue-header">
            <h3>Очередь индексации</h3>
            <div className="queue-actions">
              <button className="btn-action orange"><i className="fa fa-pause"></i> Приостановить все</button>
              <button className="btn-action red"><i className="fa fa-times"></i> Очистить завершённые</button>
            </div>
          </div>

          <div className="queue-list">
            {/* Элементы очереди – скопируйте из исходного кода */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IndexingPage;