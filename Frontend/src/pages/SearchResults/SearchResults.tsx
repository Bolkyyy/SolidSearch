import Layout from "../../components/Layout/Layout";

const SearchResults = () => {
  return (
    <Layout>
      <div className="search-results-wrapper">
        {/* Левая колонка */}
        <div className="search-results-main">
          {/* Заголовок */}
          <div className="search-results-heading">
            <h2 className="search-results-title">
              Найти договор на ремонт путей за 2019 год
            </h2>
            <span className="search-results-count">Найдено: 3</span>
          </div>

          {/* Ответ системы */}
          <div className="ai-answer-block">
            <div className="ai-answer-header">
              <span className="ai-answer-icon">
                <i className="fas fa-robot"></i>
              </span>
              <span className="ai-answer-label">Ответ системы</span>
            </div>
            <p className="ai-answer-text">
              По вашему запросу найден{" "}
              <strong>Договор №451/2019 на ремонт железнодорожных путей</strong>
              , заключённый 15 марта 2019 года с{" "}
              <strong>ООО «СтройПуть»</strong>. Договор предусматривает
              выполнение работ по капитальному ремонту путей участка км 15-25
              протяжённостью 10 км.
            </p>
            <div className="ai-answer-meta-grid">
              <div className="ai-meta-item ai-meta-blue">
                <span className="ai-meta-label">
                  <i className="fas fa-calendar-alt"></i> Дата договора
                </span>
                <span className="ai-meta-value">15 марта 2019</span>
              </div>
              <div className="ai-meta-item ai-meta-green">
                <span className="ai-meta-label">
                  <i className="fas fa-ruble-sign"></i> Сумма
                </span>
                <span className="ai-meta-value">12 500 000 ₽</span>
              </div>
              <div className="ai-meta-item ai-meta-purple">
                <span className="ai-meta-label">
                  <i className="fas fa-building"></i> Подрядчик
                </span>
                <span className="ai-meta-value">ООО «СтройПуть»</span>
              </div>
              <div className="ai-meta-item ai-meta-orange">
                <span className="ai-meta-label">
                  <i className="fas fa-file-alt"></i> Номер документа
                </span>
                <span className="ai-meta-value">№451/2019</span>
              </div>
            </div>
            <p className="ai-answer-footer">
              * Ответ сформирован на основе 3 источников из архива
            </p>
          </div>

          {/* Релевантные документы */}
          <h3 className="relevant-docs-title">Релевантные документы</h3>

          <div className="doc-card">
            <div className="doc-card-header">
              <span className="doc-card-title">
                Договор №451/2019 на ремонт железнодорожных путей
              </span>
              <span className="doc-match-badge doc-match-green">
<<<<<<< HEAD
                <i class="fa fa-arrow-up" aria-hidden="true"></i> 95<span className="percent-symbol">%</span>
=======
                <i className="fa fa-arrow-up" aria-hidden="true"></i> 95<span className="percent-symbol">%</span>
>>>>>>> 1f34e3fab06e35cc36605e5473e8e759e15b1fc6
              </span>
            </div>
            <div className="doc-card-meta">
              Договор &nbsp;•&nbsp; 15.03.2019 &nbsp;•&nbsp; ДГВ-2019-0451
            </div>
            <p className="doc-card-desc">
              Договор на выполнение работ по капитальному ремонту
              железнодорожных путей участка км 15-25 с ООО «СтройПуть». Общая
              стоимость работ 12 500 000 рублей.
            </p>
            <div className="doc-card-tags">
              <span className="doc-tag">Подрядчик: ООО СтройПуть</span>
              <span className="doc-tag">Сумма: 12 500 000 ₽</span>
            </div>
            <div className="doc-card-actions">
              <button className="btn-open">
<<<<<<< HEAD
                <i class="fa fa-external-link" aria-hidden="true"></i> Открыть
              </button>
              <button className="doc-action-btn">Показать фрагмент</button>
              <button className="doc-action-btn"><i class="fa fa-plus" aria-hidden="true"></i> Добавить в сравнение</button>
=======
                <i className="fa fa-external-link" aria-hidden="true"></i> Открыть
              </button>
              <button className="doc-action-btn">Показать фрагмент</button>
              <button className="doc-action-btn"><i className="fa fa-plus" aria-hidden="true"></i> Добавить в сравнение</button>
>>>>>>> 1f34e3fab06e35cc36605e5473e8e759e15b1fc6
            </div>
          </div>

          <div className="doc-card">
            <div className="doc-card-header">
              <span className="doc-card-title">
                Акт выполненных работ №128-2019
              </span>
              <span className="doc-match-badge doc-match-green">
<<<<<<< HEAD
                <i class="fa fa-arrow-up" aria-hidden="true"></i> 89<span className="percent-symbol">%</span>
=======
                <i className="fa fa-arrow-up" aria-hidden="true"></i> 89<span className="percent-symbol">%</span>
>>>>>>> 1f34e3fab06e35cc36605e5473e8e759e15b1fc6
              </span>
            </div>
            <div className="doc-card-meta">
              Акт &nbsp;•&nbsp; 20.08.2019 &nbsp;•&nbsp; АРК-2019-0752
            </div>
            <p className="doc-card-desc">
              Приёмка выполненных работ по договору №451/2019. Все работы
              выполнены в полном объёме и в соответствии с техническим заданием.
            </p>
            <div className="doc-card-tags">
              <span className="doc-tag">Ответственный: Иванов П.С.</span>
              <span className="doc-tag">Статус: Принято</span>
            </div>
            <div className="doc-card-actions">
              <button className="btn-open">
<<<<<<< HEAD
                <i class="fa fa-external-link" aria-hidden="true"></i> Открыть
              </button>
              <button className="doc-action-btn">Показать фрагмент</button>
              <button className="doc-action-btn"><i class="fa fa-plus" aria-hidden="true"></i> Добавить в сравнение</button>
=======
                <i className="fa fa-external-link" aria-hidden="true"></i> Открыть
              </button>
              <button className="doc-action-btn">Показать фрагмент</button>
              <button className="doc-action-btn"><i className="fa fa-plus" aria-hidden="true"></i> Добавить в сравнение</button>
>>>>>>> 1f34e3fab06e35cc36605e5473e8e759e15b1fc6
            </div>
          </div>

          <div className="doc-card">
            <div className="doc-card-header">
              <span className="doc-card-title">
                Техническое задание к договору №451/2019
              </span>
              <span className="doc-match-badge doc-match-green">
<<<<<<< HEAD
                <i class="fa fa-arrow-up" aria-hidden="true"></i> 82<span className="percent-symbol">%</span>
=======
                <i className="fa fa-arrow-up" aria-hidden="true"></i> 82<span className="percent-symbol">%</span>
>>>>>>> 1f34e3fab06e35cc36605e5473e8e759e15b1fc6
              </span>
            </div>
            <div className="doc-card-meta">
              Спецификация &nbsp;•&nbsp; 10.03.2019 &nbsp;•&nbsp; АРК-2019-0438
            </div>
            <p className="doc-card-desc">
              Требования к качеству материалов, технологии производства работ и
              срокам выполнения ремонта путевого хозяйства.
            </p>
            <div className="doc-card-tags">
              <span className="doc-tag">Страниц: 24</span>
              <span className="doc-tag">Приложений: 5</span>
            </div>
            <div className="doc-card-actions">
              <button className="btn-open">
<<<<<<< HEAD
                <i class="fa fa-external-link" aria-hidden="true"></i> Открыть
              </button>
              <button className="doc-action-btn">Показать фрагмент</button>
              <button className="doc-action-btn"><i class="fa fa-plus" aria-hidden="true"></i> Добавить в сравнение</button>
=======
                <i className="fa fa-external-link" aria-hidden="true"></i> Открыть
              </button>
              <button className="doc-action-btn">Показать фрагмент</button>
              <button className="doc-action-btn"><i className="fa fa-plus" aria-hidden="true"></i> Добавить в сравнение</button>
>>>>>>> 1f34e3fab06e35cc36605e5473e8e759e15b1fc6
            </div>
          </div>
        </div>

        {/* Правая панель */}
        <div className="search-results-sidebar">
          <h4 className="sources-title">Источники</h4>

          <div className="source-item">
            <div className="source-item-header">
              <span className="source-item-name">
                Договор №451/2019 на ремонт ж/д путей
              </span>
              <span className="doc-match-badge doc-match-green">
<<<<<<< HEAD
                <i class="fa fa-arrow-up" aria-hidden="true"></i> 95<span className="percent-symbol">%</span>
=======
                <i className="fa fa-arrow-up" aria-hidden="true"></i> 95<span className="percent-symbol">%</span>
>>>>>>> 1f34e3fab06e35cc36605e5473e8e759e15b1fc6
              </span>
            </div>
            <div className="source-item-page">Страница 3</div>
            <p className="source-item-snippet">
              Договор на выполнение работ по капитальному ремонту ж/д путей
              участка км 15-25 общей протяжённостью 10 км.
            </p>
            <a href="#" className="source-item-link">
<<<<<<< HEAD
              <i class="fa fa-folder-open" aria-hidden="true"></i> Открыть документ 
=======
              <i className="fa fa-folder-open" aria-hidden="true"></i> Открыть документ 
>>>>>>> 1f34e3fab06e35cc36605e5473e8e759e15b1fc6
            </a>
          </div>

          <div className="source-item">
            <div className="source-item-header">
              <span className="source-item-name">
                Акт выполненных работ №128-2019
              </span>
              <span className="doc-match-badge doc-match-green">
<<<<<<< HEAD
                <i class="fa fa-arrow-up" aria-hidden="true"></i> 89<span className="percent-symbol">%</span>
=======
                <i className="fa fa-arrow-up" aria-hidden="true"></i> 89<span className="percent-symbol">%</span>
>>>>>>> 1f34e3fab06e35cc36605e5473e8e759e15b1fc6
              </span>
            </div>
            <div className="source-item-page">Страница 1</div>
            <p className="source-item-snippet">
              Приёмка выполненных работ по договору №451/2019 на сумму 12 500
              000 рублей.
            </p>
            <a href="#" className="source-item-link">
<<<<<<< HEAD
              <i class="fa fa-folder-open" aria-hidden="true"></i> Открыть документ
=======
              <i className="fa fa-folder-open" aria-hidden="true"></i> Открыть документ
>>>>>>> 1f34e3fab06e35cc36605e5473e8e759e15b1fc6
            </a>
          </div>

          <div className="source-item source-item-last">
            <div className="source-item-header">
              <span className="source-item-name">
                Техническое задание к договору №451/2019
              </span>
              <span className="doc-match-badge doc-match-green">
<<<<<<< HEAD
                <i class="fa fa-arrow-up" aria-hidden="true"></i> 82<span className="percent-symbol">%</span>
=======
                <i className="fa fa-arrow-up" aria-hidden="true"></i> 82<span className="percent-symbol">%</span>
>>>>>>> 1f34e3fab06e35cc36605e5473e8e759e15b1fc6
              </span>
            </div>
            <div className="source-item-page">Страница 7</div>
            <p className="source-item-snippet">
              Требования к качеству материалов и срокам выполнения ремонтных
              работ путевого хозяйства.
            </p>
            <a href="#" className="source-item-link">
<<<<<<< HEAD
              <i class="fa fa-folder-open" aria-hidden="true"></i> Открыть документ
=======
              <i className="fa fa-folder-open" aria-hidden="true"></i> Открыть документ
>>>>>>> 1f34e3fab06e35cc36605e5473e8e759e15b1fc6
            </a>
          </div>

          <div className="sources-tip">
            <i className="fas fa-lightbulb"></i> <strong>Совет:</strong> Все
            цитаты взяты из проверенных документов архива. Кликните на источник,
            чтобы увидеть полный контекст.
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SearchResults;