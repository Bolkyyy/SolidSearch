import { useState } from 'react';
import Layout from '../../components/Layout/Layout';

const DocumentCard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, fragments, fulltext, metadata, history

  return (
    <Layout>
      <div className="document-card-page">
        <div className="document-layout">
          {/* Левая колонка - основной контент */}
          <div className="document-content">
            <div className="back-button">
              <i className="fa fa-arrow-left"></i> Назад к результатам
            </div>

            {/* Заголовок документа */}
            <div className="document-header">
              <h1>Договор №451/2019 на ремонт железнодорожных путей</h1>
              <div className="document-type">Договор • 15.03.2019</div>
            </div>

            {/* Вкладки */}
            <div className="document-tabs">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Обзор
              </button>
              <button 
                className={`tab-btn ${activeTab === 'fragments' ? 'active' : ''}`}
                onClick={() => setActiveTab('fragments')}
              >
                Фрагменты
              </button>
              <button 
                className={`tab-btn ${activeTab === 'fulltext' ? 'active' : ''}`}
                onClick={() => setActiveTab('fulltext')}
              >
                Полный текст
              </button>
              <button 
                className={`tab-btn ${activeTab === 'metadata' ? 'active' : ''}`}
                onClick={() => setActiveTab('metadata')}
              >
                Метаданные
              </button>
              <button 
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                История
              </button>
            </div>

            {/* Контент вкладок */}
            <div className="tab-content">
              {/* Обзор */}
{activeTab === 'overview' && (
  <div className="overview-tab">
    <div className="overview-card">
      <h2>Обзор документа</h2>
      <div className="overview-content">
        <div className="overview-section">
          <h3>Описание договора</h3>
          <p>
            Договор на выполнение работ по капитальному ремонту железнодорожных путей 
            участка км 15-25 общей протяженностью 10 км, заключенный между заказчиком 
            и ООО "СтройПуть".
          </p>
        </div>
        
        <div className="overview-section">
          <h3>Условия договора</h3>
          <p>
            Общая стоимость работ составляет 12 500 000 (двенадцать миллионов пятьсот тысяч) рублей. 
            Срок выполнения работ: с 01.04.2019 по 31.08.2019.
          </p>
        </div>
        
        <div className="overview-section">
          <h3>Выполнение работ</h3>
          <p>
            Все работы выполнены в полном объеме и в соответствии с техническим заданием. 
            Подписан акт приемки №128-2019 от 20.08.2019.
          </p>
        </div>
      </div>
    </div>
  </div>
)}

              {/* Фрагменты */}
              {activeTab === 'fragments' && (
                <div className="fragments-tab">
                  <div className="key-fragments">
                    <h2>Ключевые фрагменты</h2>
                    
                    <div className="fragment-item">
                      <div className="fragment-header">
                        <span className="fragment-page">Страница 1</span>
                        <span className="fragment-relevance">95% релевантность</span>
                      </div>
                      <p className="fragment-text">
                        Договор на выполнение работ по капитальному ремонту железнодорожных путей участка км 15-25 общей протяженностью 10 км
                      </p>
                    </div>

                    <div className="fragment-item">
                      <div className="fragment-header">
                        <span className="fragment-page">Страница 3</span>
                        <span className="fragment-relevance">89% релевантность</span>
                      </div>
                      <p className="fragment-text">
                        Общая стоимость работ составляет 12 500 000 (двенадцать миллионов пятьсот тысяч) рублей
                      </p>
                    </div>

                    <div className="fragment-item">
                      <div className="fragment-header">
                        <span className="fragment-page">Страница 5</span>
                        <span className="fragment-relevance">82% релевантность</span>
                      </div>
                      <p className="fragment-text">
                        Срок выполнения работ: с 01.04.2019 по 31.08.2019
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Полный текст */}
              {activeTab === 'fulltext' && (
                <div className="fulltext-tab">
                  <div className="fulltext-content">
                    <h2>ДОГОВОР №451/2019</h2>
                    <p className="fulltext-place">г. Москва, 15 марта 2019 г.</p>
                    <p>
                      Заказчик, в лице директора Иванова П.С., действующего на основании Устава, с одной стороны, 
                      и Подрядчик ООО "СтройПуть", в лице генерального директора Петрова А.В., действующего на 
                      основании Устава, с другой стороны, заключили настоящий договор о нижеследующем:
                    </p>
                    
                    <h3>1. ПРЕДМЕТ ДОГОВОРА</h3>
                    <p>
                      1.1. Подрядчик обязуется выполнить работы по капитальному ремонту железнодорожных путей 
                      участка км 15-25 общей протяженностью 10 км, а Заказчик обязуется принять и оплатить эти работы.
                    </p>
                    
                    <h3>2. СТОИМОСТЬ РАБОТ</h3>
                    <p>
                      2.1. Общая стоимость работ составляет 12 500 000 (двенадцать миллионов пятьсот тысяч) рублей.
                    </p>
                    
                    <h3>3. СРОКИ ВЫПОЛНЕНИЯ</h3>
                    <p>
                      3.1. Срок выполнения работ: с 01.04.2019 по 31.08.2019.
                    </p>
                  </div>
                </div>
              )}

              {/* Метаданные */}
              {activeTab === 'metadata' && (
                <div className="metadata-tab">
                  <div className="metadata-grid">
                    <div className="metadata-item">
                      <span className="metadata-label">Формат файла</span>
                      <span className="metadata-value">PDF</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Количество страниц</span>
                      <span className="metadata-value">12</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Создан</span>
                      <span className="metadata-value">15.03.2019 14:30</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Проиндексирован</span>
                      <span className="metadata-value">21.03.2019 02:45</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Размер файла</span>
                      <span className="metadata-value">2.4 MB</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Язык</span>
                      <span className="metadata-value">Русский</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Последнее изменение</span>
                      <span className="metadata-value">20.03.2019 10:15</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Вектор модель</span>
                      <span className="metadata-value">text-embedding-ada-002</span>
                    </div>
                  </div>
                </div>
              )}

              {/* История */}
              {activeTab === 'history' && (
                <div className="history-tab">
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Документ создан</div>
                        <div className="timeline-date">15.03.2019 14:30</div>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Добавлен в архив</div>
                        <div className="timeline-date">Петрова М.А. 20.03.2019 10:15</div>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Проиндексирован</div>
                        <div className="timeline-date">Система: 21.03.2019 02:45</div>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-title">Просмотр</div>
                        <div className="timeline-date">Иванов П.С. 26.03.2020 15:22</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка - фиксированная информация */}
          <div className="document-sidebar">
            <div className="info-section">
              <h2>Основная информация</h2>
              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">Название документа:</span>
                  <span className="info-value">Договор №451/2019 на ремонт железнодорожных путей</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Тип:</span>
                  <span className="info-value">Договор</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Дата:</span>
                  <span className="info-value">15.03.2019</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Номер:</span>
                  <span className="info-value">№451/2019</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Ответственное лицо:</span>
                  <span className="info-value">Иванов Петр Сергеевич</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Сумма:</span>
                  <span className="info-value">12 500 000 ₽</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Подрядчик:</span>
                  <span className="info-value">ООО "СтройПуть"</span>
                </div>
              </div>
            </div>

            <div className="related-section">
              <h2>Связанные сущности</h2>
              <div className="related-grid">
                <div className="related-item">
                  <span className="related-label">Подрядчик</span>
                  <span className="related-value">ООО "СтройПуть"</span>
                </div>
                <div className="related-item">
                  <span className="related-label">Акт приемки</span>
                  <span className="related-value">№128-2019</span>
                </div>
                <div className="related-item">
                  <span className="related-label">Смета</span>
                  <span className="related-value">№451-C</span>
                </div>
                <div className="related-item">
                  <span className="related-label">Ответственный</span>
                  <span className="related-value">Иванов П.С.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentCard;