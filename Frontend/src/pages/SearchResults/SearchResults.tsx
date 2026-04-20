import { useState } from 'react';
import Layout from '../../components/Layout/Layout';

const EXAMPLE_QUERIES = [
  'Найти договор на ремонт путей за 2019 год',
  'Показать акты с подрядчиком за 2021 год',
  'Какие документы содержат сумму выше 5 млн рублей',
];

const MOCK_RESULTS = {
  query: 'Найти договор на ремонт путей за 2019 год',
  count: 3,
  aiAnswer: {
    text: 'По вашему запросу найден <strong>Договор №451/2019 на ремонт железнодорожных путей</strong>, заключённый 15 марта 2019 года с ООО "СтройПуть". Договор предусматривает выполнение работ по капитальному ремонту путей участка км 15–25 протяжённостью 10 км.',
    fields: [
      { label: 'Дата договора', value: '15 марта 2019', icon: 'fa-calendar-alt', colorClass: 'sr-field-blue' },
      { label: 'Сумма', value: '12 500 000 ₽', icon: 'fa-dollar-sign', colorClass: 'sr-field-green' },
      { label: 'Подрядчик', value: 'ООО "СтройПуть"', icon: 'fa-building', colorClass: 'sr-field-green' },
      { label: 'Номер документа', value: '№451/2019', icon: 'fa-file-alt', colorClass: 'sr-field-orange' },
    ],
    sourcesCount: 3,
  },
  documents: [
    {
      id: 1,
      title: 'Договор №451/2019 на ремонт железнодорожных путей',
      type: 'Договор',
      date: '15.03.2019',
      archive: 'АРХ-2019-0451',
      scoreClass: 'sr-score-green',
      score: 95,
      excerpt: 'Договор на выполнение работ по капитальному ремонту железнодорожных путей участка км 15–25 с ООО "СтройПуть". Общая стоимость работ: 12 500 000 рублей.',
      tags: ['Подрядчик: ООО "СтройПуть"', 'Сумма: 12 500 000 ₽'],
    },
    {
      id: 2,
      title: 'Акт выполненных работ №128-2019',
      type: 'Акт',
      date: '20.08.2019',
      archive: 'АРХ-2019-0782',
      scoreClass: 'sr-score-blue',
      score: 89,
      excerpt: 'Приёмка выполненных работ по договору №451/2019. Все работы выполнены в полном объёме и в соответствии с техническим заданием.',
      tags: ['Ответственный: Иванов П.С.', 'Статус: Принято'],
    },
    {
      id: 3,
      title: 'Техническое задание к договору №451/2019',
      type: 'Спецификация',
      date: '10.03.2019',
      archive: 'АРХ-2019-0438',
      scoreClass: 'sr-score-orange',
      score: 82,
      excerpt: 'Требования к качеству материалов, технологии производства работ и срокам выполнения ремонтных работ путевого хозяйства.',
      tags: ['Страниц: 24', 'Приложений: 5'],
    },
  ],
  sources: [
    {
      id: 1,
      title: 'Договор №451/2019 на ремонт ж/д путей',
      page: 'Страница 3',
      excerpt: 'Договор на выполнение работ по капитальному ремонту железнодорожных путей участка км 15–25 общей протяжённостью 10 км.',
      scoreClass: 'sr-score-green',
      score: 95,
    },
    {
      id: 2,
      title: 'Акт выполненных работ №128-2019',
      page: 'Страница 1',
      excerpt: 'Приёмка выполненных работ по договору №451/2019 на сумму 12 500 000 рублей.',
      scoreClass: 'sr-score-blue',
      score: 89,
    },
    {
      id: 3,
      title: 'Техническое задание к договору №451/2019',
      page: 'Страница 2',
      excerpt: 'Требования к качеству материалов и срокам выполнения ремонтных работ путевого хозяйства.',
      scoreClass: 'sr-score-orange',
      score: 82,
    },
  ],
};

const SearchResults = () => {
  const [results, setResults] = useState<typeof MOCK_RESULTS | null>(null);
  const [inputValue, setInputValue] = useState('');

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    setResults({ ...MOCK_RESULTS, query: q });
    setInputValue(q);
  };

  if (!results) {
    return (
      <Layout>
        <div className="sr-empty-page">
          <div className="ai-status-badge">
            <i className="fas fa-star-of-life"></i> AI-powered поиск по архивам
          </div>
          <h1 className="sr-empty-title">Найдите любой документ за секунды</h1>
          <p className="sr-empty-sub">Задавайте вопросы на естественном языке и получайте точные ответы с цитатами</p>

          <div className="sr-empty-searchbox">
            <i className="fas fa-search sr-empty-icon"></i>
ut
              className="sr-empty-input"
              placeholder="Введите запрос на естественном языке"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(inputValue)}
            <i className="fas fa-microphone sr-empty-mic"></i>
            <button className="sr-empty-btn" onClick={() => handleSearch(inputValue)}>
              Найти <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          <div className="query-examples" style={{ alignItems: 'flex-start', width: '100%', maxWidth: 700 }}>
            <span className="examples-label">Примеры запросов:</span>
            <div className="chips-container">
              {EXAMPLE_QUERIES.map((q) => (
                <button key={q} className="chip" onClick={() => handleSearch(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="sr-breadcrumb">
        <span className="sr-bread-link" onClick={() => setResults(null)}>Поиск</span>
        <i className="fas fa-chevron-right sr-bread-sep"></i>
        <span className="sr-bread-current">Результаты</span>
      </div>

      <div className="sr-result-heading">
        <h1 className="sr-result-h1">{results.query}</h1>
        <span className="sr-found-badge">Найдено: {results.count}</span>
      </div>

      <div className="sr-top-search">
        <div className="search-wrapper" style={{ flex: 1 }}>
          <i className="fas fa-search" style={{ color: '#666', marginRight: 12, fontSize: 14 }}></i>
          <input
            className="search-bar"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(inputValue)}
          />
        </div>
        <button className="sr-empty-btn sr-empty-btn--square" onClick={() => handleSearch(inputValue)}>
          Найти <i className="fas fa-arrow-right"></i>
        </button>
      </div>

      <div className="sr-layout">
        <div className="sr-main-col">

          <div className="sr-ai-block">
            <div className="sr-ai-header">
              <i className="fas fa-star-of-life sr-ai-icon"></i>
              <span>Ответ системы</span>
            </div>
            <p className="sr-ai-text" dangerouslySetInnerHTML={{ __html: results.aiAnswer.text }} />
            <div className="sr-ai-fields">
              {results.aiAnswer.fields.map((f) => (
                <div className="sr-ai-field" key={f.label}>
                  <div className="sr-ai-field-label">
                    <i className={`fas ${f.icon} ${f.colorClass}`}></i>
                    {f.label}
                  </div>
                  <div className={`sr-ai-field-value ${f.colorClass}`}>{f.value}</div>
                </div>
              ))}
            </div>
            <div className="sr-ai-footer">
              <i className="fas fa-circle sr-ai-dot"></i>
              Ответ сформирован на основе {results.aiAnswer.sourcesCount} источников из архива
            </div>
          </div>

          <h3 className="sr-section-title">Релевантные документы</h3>

          {results.documents.map((doc) => (
            <div className="sr-doc-card" key={doc.id}>
              <div className="sr-doc-title-row">
                <span className="sr-doc-title">{doc.title}</span>
                <span className={`sr-doc-score ${doc.scoreClass}`}>↗ {doc.score}%</span>
              </div>
              <div className="sr-doc-meta">
                <span className="sr-doc-type">{doc.type}</span>
                <span className="sr-doc-dot">•</span>
                <span>{doc.date}</span>
                <span className="sr-doc-dot">•</span>
                <span className="sr-doc-archive">{doc.archive}</span>
              </div>
              <p className="sr-doc-excerpt">{doc.excerpt}</p>
              <div className="sr-doc-tags">
                {doc.tags.map((t) => (
                  <span className="sr-doc-tag" key={t}>{t}</span>
                ))}
              </div>
              <div className="sr-doc-actions">
                <button className="sr-btn-open">
                  <i className="fas fa-external-link-alt"></i> Открыть
                </button>
                <button className="history-action-btn">Показать фрагмент</button>
                <button className="history-action-btn">
                  <i className="fas fa-plus"></i> Добавить в сравнение
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="sr-sources-col">
          <div className="sr-sources-block">
            <h4 className="sr-sources-title">Источники</h4>
            {results.sources.map((s) => (
              <div className="sr-source-item" key={s.id}>
                <div className="sr-source-top">
                  <span className="sr-source-name">{s.title}</span>
                  <span className={`sr-source-score ${s.scoreClass}`}>{s.score}%</span>
                </div>
                <div className="sr-source-page">{s.page}</div>
                <p className="sr-source-excerpt">{s.excerpt}</p>
                <button className="sr-source-link">
                  Открыть документ <i className="fas fa-external-link-alt"></i>
                </button>
              </div>
            ))}
            <div className="sr-sources-tip">
              Совет: Все цитаты взяты из проверенных документов архива. Кликните на источник, чтобы увидеть полный контекст.
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default SearchResults; 