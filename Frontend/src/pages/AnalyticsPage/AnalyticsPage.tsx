import React, { useState, useRef, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DashboardData, fetchDashboardData } from '@/api/dashboard';
import { analyticsApi, QueryStat } from '@/api/Analytics';

const lineData = [
  { name: '20.01', val: 70 },
  { name: '20.01', val: 140 },
  { name: '20.01', val: 110 },
  { name: '20.01', val: 10 },
  { name: 'егор', val: 250 },
  { name: '20.01', val: 60 },
];

const pieData = [
  { name: 'Договоры', value: 8934, color: '#00d2ff' },
  { name: 'Акты', value: 6721, color: '#a855f7' },
  { name: 'Сметы', value: 3456, color: '#10b981' },
  { name: 'Накладные', value: 2341, color: '#f97316' },
  { name: 'Другое', value: 1135, color: '#eab308' },
];

interface SearchQueryData {
  name: string;
  val: number;
}

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Последние 7 дней');
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [chartFilter, setChartFilter] = useState('Кол-во запросов');
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [distFilter, setDistFilter] = useState('Распределение п..');
  const [isDistOpen, setIsDistOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [searchData, setSearchData] = useState<SearchQueryData[] | null>(null);


  const timeRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const distRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (timeRef.current && !timeRef.current.contains(e.target as Node)) setIsTimeOpen(false);
      if (chartRef.current && !chartRef.current.contains(e.target as Node)) setIsChartOpen(false);
      if (distRef.current && !distRef.current.contains(e.target as Node)) setIsDistOpen(false);
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  async function apiGetDashboard() {
    try {
      const response = await fetchDashboardData();
      setDashboardData(response);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchSearchAnalytics() {
    try {
      const response = await analyticsApi.getSearchAnalytics(10);
      const transformedData = response.map(item => {
        const dateObj = new Date(item.date);
        dateObj.setHours(dateObj.getHours() + 3);
        const dateStr = dateObj.toISOString().split('T')[0];
        return { name: dateStr, val: item.count }
      })
      console.log(transformedData);
      setSearchData(transformedData);
    } catch (e) {
      console.error(e);
    }
  }


  useEffect(() => {
    apiGetDashboard();
    fetchSearchAnalytics();
  }, []);

  return (
    <Layout>
      <section className="welcome" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Аналитика</h1>
          <p className="welcome-link">Статистика использования и эффективности системы</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="filter-dropdown-container" ref={timeRef}>
            <button className="filter-dropdown-btn" onClick={() => setIsTimeOpen(!isTimeOpen)}>
              {timeRange} <i className="fa fa-chevron-down"></i>
            </button>
            {isTimeOpen && (
              <div className="filter-dropdown-menu">
                <div onClick={() => { setTimeRange('Последние 7 дней'); setIsTimeOpen(false); }}>Последние 7 дней</div>
                <div onClick={() => { setTimeRange('Последние 30 дней'); setIsTimeOpen(false); }}>Последние 30 дней</div>
              </div>
            )}
          </div>
          <button className="analytics-export-btn">
            <i className="fa fa-download" style={{ marginRight: '8px' }}></i> Экспорт
          </button>
        </div>
      </section>

      <div className="analytics-stats-grid">
        <div className="stat-card glow-blue">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper blue-bg"><i className="fa fa-search text-blue"></i></div>
            <span className="stat-trend trend-blue">+12%</span>
          </div>
          <p className="stat-label">Количество обращений</p>
          <h3 className="stat-value">1,456</h3>
        </div>
        <div className="stat-card glow-green">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper green-bg"><i className="fa fa-chart-line text-green"></i></div>
            <span className="stat-trend trend-green">+8%</span>
          </div>
          <p className="stat-label">Средняя релевантность</p>
          <h3 className="stat-value">92%</h3>
        </div>
        <div className="stat-card glow-purple">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper purple-bg"><i className="fa fa-clock text-purple"></i></div>
            <span className="stat-trend trend-purple">-0.2 сек</span>
          </div>
          <p className="stat-label">Среднее время ответа</p>
          <h3 className="stat-value">1.2 сек</h3>
        </div>
        <div className="stat-card glow-orange">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper orange-bg"><i className="fa fa-users text-orange"></i></div>
            <span className="stat-trend trend-orange">+{dashboardData?.totalNewUsers || 0}</span>
          </div>
          <p className="stat-label">Активных пользователей</p>
          <h3 className="stat-value">{dashboardData?.totalActiveUsers || 0}</h3>
        </div>
      </div>

      <div className="analytics-charts-grid">
        {searchData &&
          <div className="chart-large-card">
            <div className="chart-header">
              <h3>Количество запросов</h3>
              <div className="filter-dropdown-container" ref={chartRef}>
                <button className="filter-dropdown-btn small" onClick={() => setIsChartOpen(!isChartOpen)}>
                  {chartFilter} <i className="fa fa-chevron-down"></i>
                </button>
                {isChartOpen && (
                  <div className="filter-dropdown-menu">
                    <div onClick={() => { setChartFilter('Кол-во запросов'); setIsChartOpen(false); }}>Кол-во запросов</div>
                    <div onClick={() => { setChartFilter('Время ответа'); setIsChartOpen(false); }}>Время ответа</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="99%" height="100%">
                <LineChart data={searchData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} dx={-10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>}
        <div className="chart-large-card">
          <div className="chart-header">
            <h3>Распределение по типам документов</h3>
            <div className="filter-dropdown-container" ref={distRef}>
              <button className="filter-dropdown-btn small" onClick={() => setIsDistOpen(!isDistOpen)}>
                {distFilter} <i className="fa fa-chevron-down"></i>
              </button>
              {isDistOpen && (
                <div className="filter-dropdown-menu">
                  <div onClick={() => { setDistFilter('Распределение п..'); setIsDistOpen(false); }}>По типам</div>
                  <div onClick={() => { setDistFilter('По размеру'); setIsDistOpen(false); }}>По размеру</div>
                </div>
              )}
            </div>
          </div>

          <div className="donut-chart-layout">
            <div style={{ width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="donut-legend">
              {pieData.map((item, i) => (
                <div className="legend-item" key={i}>
                  <span className="dot" style={{ backgroundColor: item.color }}></span>
                  <div>
                    <p className="legend-title">{item.name}</p>
                    <p className="legend-desc">{item.value.toLocaleString()} док.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;