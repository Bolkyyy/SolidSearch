import Layout from '../../components/Layout/Layout';

const AnalyticsPage = () => {
  return (
    <Layout>
      <section className="welcome" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Аналитика</h1>
          <p className="welcome-link" style={{ marginTop: '8px', color: '#888' }}>
            Статистика использования и эффективности системы
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="analytics-select-btn">
            Последние 7 дней <i className="fa fa-chevron-down" style={{ fontSize: '12px', marginLeft: '8px' }}></i>
          </div>
          <button className="analytics-export-btn">
            <i className="fa fa-download" style={{ marginRight: '8px' }}></i> Экспорт
          </button>
        </div>
      </section>

      <div className="analytics-stats-grid">
        <div className="stat-card glow-blue">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper blue-bg">
              <i className="fa fa-search text-blue"></i>
            </div>
            <span className="stat-trend trend-blue">+12%</span>
          </div>
          <p className="stat-label">Количество обращений</p>
          <h3 className="stat-value">1,456</h3>
        </div>

        <div className="stat-card glow-green">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper green-bg">
              <i className="fa fa-chart-line text-green"></i>
            </div>
            <span className="stat-trend trend-green">+8%</span>
          </div>
          <p className="stat-label">Средняя релевантность</p>
          <h3 className="stat-value">92%</h3>
        </div>

        <div className="stat-card glow-purple">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper purple-bg">
              <i className="fa fa-clock text-purple"></i>
            </div>
            <span className="stat-trend trend-purple">-0.2 сек</span>
          </div>
          <p className="stat-label">Среднее время ответа</p>
          <h3 className="stat-value">1.2 сек</h3>
        </div>

        <div className="stat-card glow-orange">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper orange-bg">
              <i className="fa fa-users text-orange"></i>
            </div>
            <span className="stat-trend trend-orange">+5</span>
          </div>
          <p className="stat-label">Активных пользователей</p>
          <h3 className="stat-value">42</h3>
        </div>
      </div>

      <div className="analytics-charts-grid">
        <div className="chart-large-card">
          <div className="chart-header">
            <h3>Количество запросов</h3>
            <div className="analytics-select-btn small">
              Кол-во запросов <i className="fa fa-chevron-down" style={{ fontSize: '10px', marginLeft: '6px' }}></i>
            </div>
          </div>
          
          <div className="chart-container-svg">
            <svg viewBox="0 0 600 240" className="svg-line-chart">
              <line x1="50" y1="30" x2="560" y2="30" stroke="#222" strokeDasharray="5,5" />
              <line x1="50" y1="80" x2="560" y2="80" stroke="#222" strokeDasharray="5,5" />
              <line x1="50" y1="130" x2="560" y2="130" stroke="#222" strokeDasharray="5,5" />
              <line x1="50" y1="180" x2="560" y2="180" stroke="#222" strokeDasharray="5,5" />
              <line x1="50" y1="220" x2="560" y2="220" stroke="#333" />

              <text x="25" y="34" fill="#666" fontSize="12">280</text>
              <text x="25" y="84" fill="#666" fontSize="12">210</text>
              <text x="25" y="134" fill="#666" fontSize="12">140</text>
              <text x="32" y="184" fill="#666" fontSize="12">70</text>
              <text x="38" y="224" fill="#666" fontSize="12">0</text>

              <defs>
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path 
                d="M 50 180 C 100 130, 120 120, 170 140 C 220 160, 240 200, 290 170 C 340 140, 370 70, 420 50 C 470 30, 520 60, 560 190" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="4" 
                filter="url(#neon-glow)"
              />

              <circle cx="50" cy="180" r="5" fill="#10b981" />
              <circle cx="170" cy="140" r="5" fill="#10b981" />
              <circle cx="290" cy="170" r="5" fill="#10b981" />
              <circle cx="420" cy="50" r="5" fill="#10b981" />
              <circle cx="560" cy="190" r="5" fill="#10b981" />

              <text x="40" y="238" fill="#666" fontSize="11">20.01</text>
              <text x="120" y="238" fill="#666" fontSize="11">20.01</text>
              <text x="200" y="238" fill="#666" fontSize="11">20.01</text>
              <text x="280" y="238" fill="#666" fontSize="11">20.01</text>
              <text x="360" y="238" fill="#666" fontSize="11">20.01</text>
              <text x="440
[02.06.2026 18:06] UnlimAI (GPT | Claude | MidJourney): " y="238" fill="#666" fontSize="11">20.01</text>
              <text x="520" y="238" fill="#666" fontSize="11">20.01</text>
            </svg>
          </div>
        </div>

        <div className="chart-large-card">
          <div className="chart-header">
            <h3>Распределение по типам документов</h3>
            <div className="analytics-select-btn small">
              Распределение п.. <i className="fa fa-chevron-down" style={{ fontSize: '10px', marginLeft: '6px' }}></i>
            </div>
          </div>

          <div className="donut-chart-layout">
            <div className="donut-svg-wrapper">
              <svg width="180" height="180" viewBox="0 0 42 42" className="donut-chart-svg">
                <circle cx="21" cy="21" r="15.91" fill="transparent" stroke="#222" strokeWidth="4"></circle>
                
                <circle cx="21" cy="21" r="15.91" fill="transparent" stroke="#00d2ff" strokeWidth="4.5" 
                        strokeDasharray="35 65" strokeDashoffset="100"></circle>
                
                <circle cx="21" cy="21" r="15.91" fill="transparent" stroke="#a855f7" strokeWidth="4.5" 
                        strokeDasharray="25 75" strokeDashoffset="65"></circle>

                <circle cx="21" cy="21" r="15.91" fill="transparent" stroke="#10b981" strokeWidth="4.5" 
                        strokeDasharray="15 85" strokeDashoffset="40"></circle>

                <circle cx="21" cy="21" r="15.91" fill="transparent" stroke="#f97316" strokeWidth="4.5" 
                        strokeDasharray="15 85" strokeDashoffset="25"></circle>

                <circle cx="21" cy="21" r="15.91" fill="transparent" stroke="#eab308" strokeWidth="4.5" 
                        strokeDasharray="10 90" strokeDashoffset="10"></circle>
              </svg>
            </div>

            <div className="donut-legend">
              <div className="legend-item">
                <span className="dot dot-blue"></span>
                <div>
                  <p className="legend-title">Договоры</p>
                  <p className="legend-desc">8 934 документов</p>
                </div>
              </div>
              <div className="legend-item">
                <span className="dot dot-purple"></span>
                <div>
                  <p className="legend-title">Акты</p>
                  <p className="legend-desc">6 721 документов</p>
                </div>
              </div>
              <div className="legend-item">
                <span className="dot dot-green"></span>
                <div>
                  <p className="legend-title">Сметы</p>
                  <p className="legend-desc">3 456 документов</p>
                </div>
              </div>
              <div className="legend-item">
                <span className="dot dot-orange"></span>
                <div>
                  <p className="legend-title">Накладные</p>
                  <p className="legend-desc">2 341 документов</p>
                </div>
              </div>
              <div className="legend-item">
                <span className="dot dot-yellow"></span>
                <div>
                  <p className="legend-title">Другое</p>
                  <p className="legend-desc">1 135 документов</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;