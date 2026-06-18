import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import Layout from "../../components/Layout/Layout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { DashboardData, fetchDashboardData } from "@/api/dashboard";
import { analyticsApi } from "@/api/Analytics";

const pieData = [
  { name: "PDF", value: 45, color: "#00d2ff" },
  { name: "DOCX", value: 30, color: "#a855f7" },
  { name: "TXT", value: 15, color: "#10b981" },
  { name: "Другое", value: 10, color: "#f97316" },
];

const pieOtherFormats = ["XML", "XLS", "XLSX", "CSV", "RTF", "HTML", "ODT"];

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  const base: React.CSSProperties = {
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: 13,
  };
  if (entry.name === "Другое") {
    return (
      <div style={base}>
        <p style={{ color: "#f97316", fontWeight: 600, marginBottom: 6 }}>
          Другое — {entry.value}%
        </p>
        {pieOtherFormats.map((fmt) => (
          <p key={fmt} style={{ color: "#aaa", margin: "2px 0" }}>
            {fmt}
          </p>
        ))}
      </div>
    );
  }
  return (
    <div style={base}>
      <p style={{ color: entry.color, fontWeight: 600 }}>
        {entry.name} — {entry.value}%
      </p>
    </div>
  );
};

interface ChartPoint {
  name: string;
  val: number;
}

type ChartFilter = "Кол-во запросов" | "Время ответа";

const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const formatDate = (d: string | Date) => {
  const obj = new Date(d);
  obj.setHours(obj.getHours() + 3);
  return obj.toISOString().split("T")[0].slice(5);
};

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState("Последние 7 дней");
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [chartFilter, setChartFilter] =
    useState<ChartFilter>("Кол-во запросов");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [searchData, setSearchData] = useState<ChartPoint[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<ChartPoint[]>([]);
  const [indexingData, setIndexingData] = useState<ChartPoint[]>([]);
  const [topQueriesData, setTopQueriesData] = useState<
    { query: string; count: number }[]
  >([]);
  const [donutTab, setDonutTab] = useState<"По типам" | "По статусам">(
    "По типам",
  );
  const [indexingTab, setIndexingTab] = useState<"По дням" | "По дням недели">(
    "По дням",
  );
  const [weekdayData, setWeekdayData] = useState<ChartPoint[]>([]);
  const [weekdayIndexingData, setWeekdayIndexingData] = useState<ChartPoint[]>(
    [],
  );
  const [relevance, setRelevance] = useState<{
    rate: number | null;
    prevRate: number | null;
  }>({ rate: null, prevRate: null });

  const timeRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const countDays = timeRange === "Последние 7 дней" ? 7 : 30;

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (timeRef.current && !timeRef.current.contains(e.target as Node))
        setIsTimeOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target as Node))
        setIsExportOpen(false);
    };
    document.addEventListener("mousedown", clickOutside, true);
    return () => document.removeEventListener("mousedown", clickOutside, true);
  }, []);

  useEffect(() => {
    fetchDashboardData().then(setDashboardData).catch(console.error);
  }, []);

  useEffect(() => {
    analyticsApi
      .getSearchAnalytics(countDays)
      .then((data) =>
        setSearchData(
          data.map((d) => ({ name: formatDate(d.date), val: +d.count })),
        ),
      )
      .catch(console.error);

    analyticsApi
      .getResponseTimeAnalytics(countDays)
      .then((data) =>
        setResponseTimeData(
          data.map((d) => ({
            name: d.date.substring(5, 10),
            val: +(+d.avg_ms / 1000).toFixed(2),
          })),
        ),
      )
      .catch(console.error);

    analyticsApi
      .getDocumentIndexingAnalytics(countDays)
      .then((data) =>
        setIndexingData(
          data.map((d) => ({ name: d.date.substring(5, 10), val: +d.count })),
        ),
      )
      .catch(console.error);

    analyticsApi
      .getTopQueries(countDays, 8)
      .then((data) =>
        setTopQueriesData(
          data.map((d) => ({
            query: d.query.length > 24 ? d.query.slice(0, 21) + "..." : d.query,
            count: +d.count,
          })),
        ),
      )
      .catch(console.error);

    analyticsApi
      .getSearchesByWeekday(countDays)
      .then((data) => {
        const byDow = Array.from({ length: 7 }, (_, i) => {
          const found = data.find((d) => +d.dow === i);
          return { name: WEEKDAYS[i], val: found ? +found.count : 0 };
        });
        setWeekdayData(WEEKDAY_ORDER.map((i) => byDow[i]));
      })
      .catch(console.error);

    analyticsApi
      .getIndexingByWeekday(countDays)
      .then((data) => {
        const byDow = Array.from({ length: 7 }, (_, i) => {
          const found = data.find((d) => +d.dow === i);
          return { name: WEEKDAYS[i], val: found ? +found.count : 0 };
        });
        setWeekdayIndexingData(WEEKDAY_ORDER.map((i) => byDow[i]));
      })
      .catch(console.error);

    analyticsApi
      .getAvgSuccessRate(countDays)
      .then(setRelevance)
      .catch(console.error);
  }, [countDays]);

  const queryDiff = dashboardData
    ? dashboardData.totalSearchToday - dashboardData.totalSearchYesterday
    : null;
  const queryTrendText =
    queryDiff != null
      ? queryDiff >= 0
        ? `+${queryDiff}`
        : `${queryDiff}`
      : "—";

  const avgAllTime = dashboardData?.avgResponseTimeSec ?? null;
  const avgPrev = dashboardData?.avgResponseTimeSecPrev ?? null;
  const timeDiff =
    avgAllTime != null && avgPrev != null
      ? +(avgPrev - avgAllTime).toFixed(2)
      : null;
  const timeTrendText =
    timeDiff != null && timeDiff !== 0
      ? `${timeDiff > 0 ? "-" : "+"}${Math.abs(timeDiff)} сек`
      : null;

  const activeChartData =
    chartFilter === "Кол-во запросов" ? searchData : responseTimeData;
  const activeChartColor =
    chartFilter === "Кол-во запросов" ? "#3b82f6" : "#a855f7";
  const activeTooltipLabel =
    chartFilter === "Кол-во запросов" ? "Запросов" : "сек";

  const tooltipStyle = {
    backgroundColor: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "8px",
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dateStamp = new Date().toISOString().split("T")[0];

  const exportToCSV = () => {
    const rows: string[] = [];
    rows.push(`Аналитика SolidSearch — ${timeRange}`);
    rows.push(`Дата выгрузки,${new Date().toLocaleDateString("ru-RU")}`);
    rows.push("");

    rows.push("Сводка");
    rows.push("Показатель,Значение");
    rows.push(`Всего запросов,${dashboardData?.totalSearch ?? 0}`);
    rows.push(`Активных пользователей,${dashboardData?.totalActiveUsers ?? 0}`);
    rows.push(`Среднее время ответа (сек),${avgAllTime?.toFixed(2) ?? "—"}`);
    rows.push(`Всего документов,${dashboardData?.totalDocuments ?? 0}`);
    rows.push(`Проиндексировано,${dashboardData?.totalIndexed ?? 0}`);
    rows.push("");

    rows.push("Количество запросов по дням");
    rows.push("Дата,Запросов");
    searchData.forEach((d) => rows.push(`${d.name},${d.val}`));
    rows.push("");

    rows.push("Среднее время ответа по дням");
    rows.push("Дата,Сек");
    responseTimeData.forEach((d) => rows.push(`${d.name},${d.val}`));
    rows.push("");

    rows.push("Индексация документов по дням");
    rows.push("Дата,Документов");
    indexingData.forEach((d) => rows.push(`${d.name},${d.val}`));
    rows.push("");

    rows.push("Топ запросов");
    rows.push("Запрос,Количество");
    topQueriesData.forEach((d) => rows.push(`"${d.query}",${d.count}`));
    rows.push("");

    rows.push("Запросы по дням недели");
    rows.push("День,Запросов");
    weekdayData.forEach((d) => rows.push(`${d.name},${d.val}`));

    const blob = new Blob(["﻿" + rows.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    triggerDownload(blob, `analytics_${dateStamp}.csv`);
  };

  const exportToJSON = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      period: timeRange,
      summary: {
        totalSearches: dashboardData?.totalSearch ?? 0,
        activeUsers: dashboardData?.totalActiveUsers ?? 0,
        avgResponseTimeSec: avgAllTime,
        totalDocuments: dashboardData?.totalDocuments ?? 0,
        totalIndexed: dashboardData?.totalIndexed ?? 0,
      },
      searchByDay: searchData,
      responseTimeByDay: responseTimeData,
      indexingByDay: indexingData,
      topQueries: topQueriesData,
      searchByWeekday: weekdayData,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    triggerDownload(blob, `analytics_${dateStamp}.json`);
  };

  const exportToPNG = async () => {
    if (!pageRef.current) return;
    const el = pageRef.current;
    const canvas = await html2canvas(el, {
      backgroundColor: "#0d0d0d",
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: -window.scrollY,
      height: el.scrollHeight,
      windowHeight: el.scrollHeight,
    });
    canvas.toBlob((blob) => {
      if (blob) triggerDownload(blob, `analytics_${dateStamp}.png`);
    }, "image/png");
  };

  return (
    <Layout>
      <div ref={pageRef}>
        <section className="welcome analytics-welcome-header">
          <div>
            <h1>Аналитика</h1>
            <p className="welcome-link">
              Статистика использования и эффективности системы
            </p>
          </div>
          <div className="analytics-header-actions">
            <div className="filter-dropdown-container" ref={timeRef}>
              <button
                className="filter-dropdown-btn"
                onClick={() => setIsTimeOpen(!isTimeOpen)}
              >
                {timeRange} <i className="fa fa-chevron-down"></i>
              </button>
              {isTimeOpen && (
                <div className="filter-dropdown-menu">
                  <div
                    onClick={() => {
                      setTimeRange("Последние 7 дней");
                      setIsTimeOpen(false);
                    }}
                  >
                    Последние 7 дней
                  </div>
                  <div
                    onClick={() => {
                      setTimeRange("Последние 30 дней");
                      setIsTimeOpen(false);
                    }}
                  >
                    Последние 30 дней
                  </div>
                </div>
              )}
            </div>
            <div className="filter-dropdown-container" ref={exportRef}>
              <button
                className="analytics-export-btn"
                onClick={() => setIsExportOpen(!isExportOpen)}
              >
                <i className="fa fa-download icon-mr"></i> Экспорт{" "}
                <i
                  className="fa fa-chevron-down"
                  style={{ marginLeft: 6, fontSize: 11 }}
                ></i>
              </button>
              {isExportOpen && (
                <div className="filter-dropdown-menu">
                  <div
                    onClick={() => {
                      exportToPNG();
                      setIsExportOpen(false);
                    }}
                  >
                    <i className="fa fa-image icon-mr"></i> PNG
                  </div>
                  <div
                    onClick={() => {
                      exportToCSV();
                      setIsExportOpen(false);
                    }}
                  >
                    <i className="fa fa-file-text-o icon-mr"></i> CSV
                  </div>
                  <div
                    onClick={() => {
                      exportToJSON();
                      setIsExportOpen(false);
                    }}
                  >
                    <i className="fa fa-file-code-o icon-mr"></i> JSON
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="analytics-stats-grid">
          <div className="stat-card glow-blue">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper blue-bg">
                <i className="fa fa-search text-blue"></i>
              </div>
              <span className="stat-trend trend-blue">{queryTrendText}</span>
            </div>
            <p className="stat-label">Количество обращений</p>
            <h3 className="stat-value">{dashboardData?.totalSearch ?? 0}</h3>
          </div>
          <div className="stat-card glow-green">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper green-bg">
                <i className="fa fa-chart-line text-green"></i>
              </div>
              {relevance.rate != null &&
                relevance.prevRate != null &&
                (() => {
                  const diff = +(relevance.rate - relevance.prevRate).toFixed(
                    1,
                  );
                  if (diff === 0) return null;
                  return (
                    <span className="stat-trend trend-green">
                      {diff > 0 ? "+" : ""}
                      {diff}%
                    </span>
                  );
                })()}
            </div>
            <p className="stat-label">Средняя релевантность</p>
            <h3 className="stat-value">
              {relevance.rate != null ? `${relevance.rate}%` : "—"}
            </h3>
          </div>
          <div className="stat-card glow-purple">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper purple-bg">
                <i className="fa fa-clock text-purple"></i>
              </div>
              {timeTrendText && (
                <span className="stat-trend trend-purple">{timeTrendText}</span>
              )}
            </div>
            <p className="stat-label">Среднее время ответа</p>
            <h3 className="stat-value">
              {avgAllTime != null ? `${avgAllTime.toFixed(2)} сек` : "—"}
            </h3>
          </div>
          <div className="stat-card glow-orange">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper orange-bg">
                <i className="fa fa-users text-orange"></i>
              </div>
              <span className="stat-trend trend-orange">
                +{dashboardData?.totalNewUsers || 0}
              </span>
            </div>
            <p className="stat-label">Активных пользователей</p>
            <h3 className="stat-value">
              {dashboardData?.totalActiveUsers || 0}
            </h3>
          </div>
        </div>

        <div className="analytics-charts-grid">
          <div className="chart-large-card">
            <div className="chart-header">
              <h3>
                {chartFilter === "Кол-во запросов"
                  ? "Количество запросов"
                  : "Время ответа"}
              </h3>
              <div className="chart-tabs">
                <button
                  className={`chart-tab${chartFilter === "Кол-во запросов" ? " active" : ""}`}
                  onClick={() => setChartFilter("Кол-во запросов")}
                >
                  Запросы
                </button>
                <button
                  className={`chart-tab${chartFilter === "Время ответа" ? " active" : ""}`}
                  onClick={() => setChartFilter("Время ответа")}
                >
                  Время ответа
                </button>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="99%" height="100%">
                <LineChart data={activeChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#222"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#666", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#666", fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [
                      `${v ?? 0} ${activeTooltipLabel}`,
                      chartFilter,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="val"
                    stroke={activeChartColor}
                    strokeWidth={3}
                    dot={{ r: 5, fill: activeChartColor, strokeWidth: 0 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut card — По типам / По статусам */}
          <div className="chart-large-card">
            <div className="chart-header">
              <h3>Типы документов</h3>
              <div className="chart-tabs">
                {(["По типам", "По статусам"] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`chart-tab${donutTab === tab ? " active" : ""}`}
                    onClick={() => setDonutTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            {donutTab === "По типам" ? (
              <div className="donut-chart-layout">
                <div className="donut-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="donut-legend">
                  {pieData.map((item, i) => (
                    <div className="legend-item" key={i}>
                      <span
                        className="dot"
                        style={{ backgroundColor: item.color }}
                      ></span>
                      <div>
                        <p className="legend-title">{item.name}</p>
                        <p className="legend-desc">{item.value}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              (() => {
                const indexed = dashboardData?.totalIndexed ?? 0;
                const notIndexed = Math.max(
                  0,
                  (dashboardData?.totalDocuments ?? 0) - indexed,
                );
                const statusData = [
                  {
                    name: "Проиндексировано",
                    value: indexed,
                    color: "#10b981",
                  },
                  {
                    name: "Не проиндексировано",
                    value: notIndexed,
                    color: "#f97316",
                  },
                ];
                return (
                  <div className="donut-chart-layout">
                    <div className="donut-wrapper">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell
                                key={index}
                                fill={entry.color}
                                stroke="none"
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={tooltipStyle}
                            formatter={(v) => [v, "Документов"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="donut-legend">
                      {statusData.map((item, i) => (
                        <div className="legend-item" key={i}>
                          <span
                            className="dot"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          <div>
                            <p className="legend-title">{item.name}</p>
                            <p className="legend-desc">{item.value} doc.</p>
                          </div>
                        </div>
                      ))}
                      <div
                        className="legend-item"
                        style={{
                          marginTop: 4,
                          borderTop: "1px solid #2a2a2a",
                          paddingTop: 10,
                        }}
                      >
                        <span
                          className="dot"
                          style={{ backgroundColor: "#555" }}
                        ></span>
                        <div>
                          <p className="legend-title">Всего</p>
                          <p className="legend-desc">
                            {dashboardData?.totalDocuments ?? 0} doc.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>

        <div className="analytics-charts-grid">
          {/* Indexing card — По дням / По дням недели */}
          <div className="chart-large-card">
            <div className="chart-header">
              <h3>Индексация документов</h3>
              <div className="chart-tabs">
                {(["По дням", "По дням недели"] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`chart-tab${indexingTab === tab ? " active" : ""}`}
                    onClick={() => setIndexingTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-wrapper">
              {indexingTab === "По дням" ? (
                <ResponsiveContainer width="99%" height="100%">
                  <BarChart data={indexingData} barSize={22}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#222"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#666", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#666", fontSize: 12 }}
                      dx={-10}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      formatter={(v) => [v ?? 0, "Документов"]}
                    />
                    <Bar dataKey="val" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="99%" height="100%">
                  <BarChart data={weekdayIndexingData} barSize={36}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#222"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#aaa", fontSize: 13 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#aaa", fontSize: 12 }}
                      dx={-10}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      labelStyle={{ color: "#fff" }}
                      itemStyle={{ color: "#aaa" }}
                      formatter={(v) => [v ?? 0, "Документов"]}
                    />
                    <Bar dataKey="val" radius={[5, 5, 0, 0]}>
                      {weekdayIndexingData.map((_, i) => (
                        <Cell key={i} fill={i >= 5 ? "#f97316" : "#10b981"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top queries card — Топ запросов / По типу */}
          <div className="chart-large-card">
            <div className="chart-header">
              <h3>Топ запросов</h3>
            </div>
            {topQueriesData.length > 0 ? (
              <div className="chart-wrapper">
                <ResponsiveContainer width="99%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topQueriesData}
                    margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#222"
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#666", fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="query"
                      width={110}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#aaa", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      formatter={(v) => [v ?? 0, "Запросов"]}
                    />
                    <Bar
                      dataKey="count"
                      fill="#a855f7"
                      radius={[0, 6, 6, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="chart-empty">Нет данных за выбранный период</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
