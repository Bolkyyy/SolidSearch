import Layout from '../../components/Layout/Layout';

const DocumentCard= () => {
  return (
    <Layout>
        <div className="search-results-page">
        <div className="query-section">
          <h2 className="query-title">Показать акты с подрядчиком за 2021 год</h2>
        </div>

        <div className="two-column-layout">
          <div className="left-column">
            <div className="response-section">
              <h3 className="response-title">Ответ системы</h3>
              <p className="response-text">
                По вашему запросу найдем Договор №451/2019 на ремонт железнодорожных путей, заключенный 15 марта 2019 года с ООО "СтройПуть". Договор предусматривает выполнение работ по капитальному ремонту путей участка км 15-25 протяженностью 10 км.
              </p>
              
              <div className="response-details">
                <div className="detail-item">
                  <span className="detail-label">Дата договора</span>
                  <span className="detail-value">15 марта 2019</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Сумма</span>
                  <span className="detail-value">12 500 000 ₽</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Подписи</span>
                  <span className="detail-value">ООО "СтройПуть"</span>
                </div>
              </div>
            </div>

            <div className="documents-tables">
              <div className="doc-card">
                <div className="doc-card-header">
                  <h4>Акт выполненных работ №128-2019</h4>
                  <span className="doc-date">Акт от 20.08.2019 г. №451/2019-0028</span>
                </div>
                <p className="doc-description">
                  Признак выполнения работ по договору №451/2019. Все работы выполнены в полном объеме и в соответствии с техническим заданием.
                </p>
                <div className="doc-actions">
                  <button className="action-btn open">Открыть</button>
                  <button className="action-btn fact">Показать факт</button>
                  <button className="action-btn compare">+ Добавить в сравнение</button>
                </div>
              </div>

              <div className="doc-card">
                <div className="doc-card-header">
                  <h4>Техническое задание к договору №451/2019</h4>
                  <span className="doc-date">Спецификация: 10.03.2019 - АР-2019-0438</span>
                </div>
                <p className="doc-description">
                  Требования к качеству материалов, технологий производства работ и сроков выполнения ремонта пунктов хозяйства.
                </p>
                <div className="doc-actions">
                  <button className="action-btn open">Открыть</button>
                  <button className="action-btn fact">Показать факт</button>
                  <button className="action-btn compare">+ Добавить в сравнение</button>
                </div>
              </div>

              <div className="doc-card">
                <div className="doc-card-header">
                  <h4>Акт выполненных работ №128-2019</h4>
                  <span className="doc-date">Акт от 20.08.2019 г. №451/2019-0038</span>
                </div>
                <p className="doc-description">
                  Признак выполнения работ по договору №451/2019. Все работы выполнены в полном объеме и в соответствии с техническим заданием.
                </p>
                <div className="doc-actions">
                  <button className="action-btn open">Открыть</button>
                  <button className="action-btn fact">Показать факт</button>
                  <button className="action-btn compare">+ Добавить в сравнение</button>
                </div>
              </div>
            </div>
          </div>

          <div className="right-column">
            <h3 className="sources-title">Источники</h3>
            
            <div className="sources-list">
              <div className="source-card">
                <div className="source-header">
                  <h4>Договор №451/2019 на ремонт ж/д путей</h4>
                  <span className="source-page">Страница 3</span>
                </div>
                <p className="source-description">
                  Договор на выполнение работ по капитальному ремонту железнодорожных путей участка км 15-25 общей протяженностью 10 км
                </p>
                <button className="open-doc-btn">Открыть документ</button>
              </div>

              <div className="source-card">
                <div className="source-header">
                  <h4>Акт выполненных работ №128-2019</h4>
                  <span className="source-page">Страница 5</span>
                </div>
                <p className="source-description">
                  Признак выполнения работ по договору №451/2019 на сумму 12 500 000 рублей
                </p>
                <button className="open-doc-btn">Открыть документ</button>
              </div>

              <div className="source-card">
                <div className="source-header">
                  <h4>Техническое задание к договору №451/2019</h4>
                  <span className="source-page">Страница 2</span>
                </div>
                <p className="source-description">
                  Требования к качеству материалов и сроков выполнения ремонтных работ пунктов хозяйства
                </p>
                <button className="open-doc-btn">Открыть документ</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default DocumentCard; 