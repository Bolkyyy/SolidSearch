import Layout from "../../components/Layout/Layout";

const IndexingPage = () => {
  return (
    <Layout>
      <section className="welcome">
        <h1>Управление индексацией</h1>
        <p className="welcome-link">Загрузка и индексация новых документов</p>
      </section>

      <div className="indexing-stats-grid">
        <div className="stat-card-indexing">
          <i className="fa fa-clock card-icon orange"></i>
          <p>В очереди</p>
          <h2>1</h2>
          <span className="trend-up-request">+0</span>
        </div>
        <div className="stat-card-indexing">
          <i className="fa fa-play-circle card-icon purple"></i>
          <p>Обрабатывается</p>
          <h2>2</h2>
          <span className="trend-up">+0</span>
        </div>
        <div className="stat-card-indexing">
          <i className="fa fa-check-circle card-icon green"></i>
          <p>Проиндексировано</p>
          <h2>2</h2>
          <span className="trend-up-index">+2</span>
        </div>
        <div className="stat-card-indexing">
          <i className="fa fa-exclamation-circle card-icon red"></i>
          <p>Ошибки</p>
          <h2>1</h2>
          <span className="trend-down">-1</span>
        </div>
      </div>

      <div className="upload-dropzone">
        <div className="upload-icon-circle">
          <i className="fa fa-upload"></i>
        </div>
        <h3>Загрузите документы для индексации</h3>
        <p>Перетащите файлы сюда или нажмите для выбора</p>
        <div className="upload-buttons">
          <button className="btn-upload-file">Выбрать файлы</button>
          <button className="btn-upload-folder">Выбрать папку</button>
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
          {/* Обрабатывается 1 */}
          <div className="queue-item-processing">
            <div className="item-main">
              <div className="item-icon purple"><i className="fa fa-play-circle"></i></div>
              <div className="item-details">
                <div className="item-title">Договор_451_2019.pdf</div>
                <div className="item-meta">Архив 2024 <span className="status-text">Обрабатывается</span></div>
              </div>
              <div className="item-progress-info">
                <span className="step-name">Извлечение текста</span>
                <span className="time-info">Начало в 10:30</span>
              </div>
            </div>
            <div className="progress-container">
              <div className="progress-bar purple" style={{ width: "45%" }}></div>
              <span className="progress-percent purple">45%</span>
            </div>
          </div>
          {/* Обрабатывается 2 */}
          <div className="queue-item-processing">
            <div className="item-main">
              <div className="item-icon purple"><i className="fa fa-play-circle"></i></div>
              <div className="item-details">
                <div className="item-title">Акт_выполненных_работ_128.docx</div>
                <div className="item-meta">Архив 2024 <span className="status-text">Обрабатывается</span></div>
              </div>
              <div className="item-progress-info">
                <span className="step-name">Создание векторов</span>
                <span className="time-info">Начало в 10:28</span>
              </div>
            </div>
            <div className="progress-container">
              <div className="progress-bar purple" style={{ width: "78%" }}></div>
              <span className="progress-percent purple">78%</span>
            </div>
          </div>
          {/* В очереди */}
          <div className="queue-item-waiting">
            <div className="item-main">
              <div className="item-icon orange"><i className="fa fa-clock"></i></div>
              <div className="item-details">
                <div className="item-title">Смета_проект_2024.xlsx</div>
                <div className="item-meta">Текущие проекты <span className="status-tag orange">В очереди</span></div>
              </div>
              <div className="item-status-right"><span>В очереди</span><span className="time-info">--:--</span></div>
            </div>
          </div>
          {/* Проиндексировано */}
          <div className="queue-item-completed">
            <div className="item-main">
              <div className="item-icon green"><i className="fa fa-check-circle"></i></div>
              <div className="item-details">
                <div className="item-title">Техническое_задание.pdf</div>
                <div className="item-meta">Текущие проекты <span className="status-tag green">Проиндексирован</span></div>
              </div>
              <div className="item-status-right"><span>Проиндексирован</span><span className="time-info">Завершено в 10:25</span></div>
            </div>
          </div>
          {/* Ошибка */}
          <div className="queue-item-error">
            <div className="item-main">
              <div className="item-icon red"><i className="fa fa-exclamation-circle"></i></div>
              <div className="item-details">
                <div className="item-title">Скан_документа_неразборчиво.pdf</div>
                <div className="item-meta">Архив 2023 <span className="status-tag red">Ошибка</span></div>
              </div>
              <div className="item-status-right"><span>Ошибка</span><span className="time-info">Завершено в 10:25</span></div>
            </div>
            <div className="error-message-box">
              <p>Не удалось распознать текст</p>
              <button className="retry-link">Попробовать снова</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IndexingPage;