import Layout from "../../components/Layout/Layout";

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
          <div className="upload-icon-circle">
            <i className="fa fa-upload"></i>
          </div>
          <h3>Загрузите документы для индексации</h3>
          <p>Перетащите файлы сюда или нажмите для выбора</p>
          <div className="upload-buttons">
            <button className="btn-upload-file primary">Выбрать файлы</button>
            <button className="btn-upload-folder primary">Выбрать папку</button>
          </div>
          <span className="upload-hint">
            Поддерживаемые форматы: PDF, DOCX, TXT, XLSX
          </span>
        </div>

        <div className="indexing-queue-container">
          <div className="queue-header">
            <h3>Очередь индексации</h3>
            <div className="queue-actions">
              <button className="btn-action orange">
                <i className="fa fa-pause"></i> Приостановить все
              </button>
              <button className="btn-action red">
                <i className="fa fa-times"></i> Очистить завершённые
              </button>
            </div>
          </div>

          <div className="queue-list">
            <div className="queue-item-processing">
              <div className="item-main">
                <div className="item-icon purple">
                  <i className="fa fa-play-circle"></i>
                </div>
                <div className="item-details">
                  <div className="item-title">Договор_451_2019.pdf</div>
                  <div className="item-meta">
                    Архив 2024{" "}
                    <span className="status-text">Обрабатывается</span>
                  </div>
                </div>
                <div className="item-progress-info">
                  <span className="step-name">Извлечение текста</span>
                  <span className="time-info">Начало в 10:30</span>
                </div>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: "45%" }}></div>
                <span className="progress-percent">45%</span>
              </div>
            </div>

            <div className="queue-item-processing">
              <div className="item-main">
                <div className="item-icon purple">
                  <i className="fa fa-play-circle"></i>
                </div>
                <div className="item-details">
                  <div className="item-title">
                    Акт_выполненных_работ_128.docx
                  </div>
                  <div className="item-meta">
                    Архив 2024{" "}
                    <span className="status-text">Обрабатывается</span>
                  </div>
                </div>
                <div className="item-progress-info">
                  <span className="step-name">Создание векторов</span>
                  <span className="time-info">Начало в 10:28</span>
                </div>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: "78%" }}></div>
                <span className="progress-percent">78%</span>
              </div>
            </div>

            <div className="queue-item-waiting">
              <div className="item-main">
                <div className="item-icon orange">
                  <i className="fa fa-clock"></i>
                </div>
                <div className="item-details">
                  <div className="item-title">Смета_проект_2024.xlsx</div>
                  <div className="item-meta">
                    Текущие проекты{" "}
                    <span className="status-tag orange">В очереди</span>
                  </div>
                </div>
                <div className="item-status-right">
                  <span>В очереди</span>
                  <span className="time-info">--:--</span>
                </div>
              </div>
            </div>

            <div className="queue-item-completed">
              <div className="item-main">
                <div className="item-icon green">
                  <i className="fa fa-check-circle"></i>
                </div>
                <div className="item-details">
                  <div className="item-title">Техническое_задание.pdf</div>
                  <div className="item-meta">
                    Текущие проекты{" "}
                    <span className="status-tag green">Проиндексирован</span>
                  </div>
                </div>
                <div className="item-status-right">
                  <span>Проиндексирован</span>
                  <span className="time-info">Завершено в 10:25</span>
                </div>
              </div>
            </div>

            <div className="queue-item-error">
              <div className="item-main">
                <div className="item-icon red">
                  <i className="fa fa-exclamation-circle"></i>
                </div>
                <div className="item-details">
                  <div className="item-title">
                    Скан_документа_неразборчиво.pdf
                  </div>
                  <div className="item-meta">
                    Архив 2023 <span className="status-tag red">Ошибка</span>
                  </div>
                </div>
                <div className="item-status-right">
                  <span>Проиндексирован</span>
                  <span className="time-info">Завершено в 10:25</span>
                </div>
              </div>
              <div className="error-message-box">
                <p>Не удалось распознать текст</p>
                <button className="retry-link">Попробовать снова</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IndexingPage;
