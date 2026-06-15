import axios from 'axios';

export interface QueryStat {
  count: number;
  date: Date;
}

export interface ResponseTimeStat {
  date: string;
  avg_ms: number;
}

export interface TopQueryStat {
  query: string;
  count: number;
}

export interface IndexingStat {
  date: string;
  count: number;
}

export const analyticsApi = {
  getSearchAnalytics: async (countDays: number = 30): Promise<QueryStat[]> => {
    const response = await axios.get(`http://localhost:3001/dashboard/search-analytics`, {
      params: { countDays }
    });
    return response.data;
  },

  getResponseTimeAnalytics: async (countDays: number = 30): Promise<ResponseTimeStat[]> => {
    const response = await axios.get(`http://localhost:3001/dashboard/response-time-analytics`, {
      params: { countDays }
    });
    return response.data;
  },

  getTopQueries: async (countDays: number = 30, limit: number = 8): Promise<TopQueryStat[]> => {
    const response = await axios.get(`http://localhost:3001/dashboard/top-queries`, {
      params: { countDays, limit }
    });
    return response.data;
  },

  getDocumentIndexingAnalytics: async (countDays: number = 30): Promise<IndexingStat[]> => {
    const response = await axios.get(`http://localhost:3001/dashboard/document-indexing-analytics`, {
      params: { countDays }
    });
    return response.data;
  },

  getSearchesByHour: async (countDays: number = 30): Promise<{ hour: number; count: number }[]> => {
    const response = await axios.get(`http://localhost:3001/dashboard/searches-by-hour`, { params: { countDays } });
    return response.data;
  },

  getSearchesByWeekday: async (countDays: number = 30): Promise<{ dow: number; count: number }[]> => {
    const response = await axios.get(`http://localhost:3001/dashboard/searches-by-weekday`, { params: { countDays } });
    return response.data;
  },

  getIndexingByWeekday: async (countDays: number = 30): Promise<{ dow: number; count: number }[]> => {
    const response = await axios.get(`http://localhost:3001/dashboard/indexing-by-weekday`, { params: { countDays } });
    return response.data;
  },

  getAvgResultCount: async (countDays: number = 30): Promise<{ date: string; avg_results: number }[]> => {
    const response = await axios.get(`http://localhost:3001/dashboard/avg-result-count`, { params: { countDays } });
    return response.data;
  },

  getQueryTypes: async (countDays: number = 30): Promise<{ type: string; count: number }[]> => {
    const response = await axios.get(`http://localhost:3001/dashboard/query-types`, { params: { countDays } });
    return response.data;
  },

  getSearchSuccessRate: async (countDays: number = 30): Promise<{ date: string; rate: number }[]> => {
    const response = await axios.get(`http://localhost:3001/dashboard/search-success-rate`, { params: { countDays } });
    return response.data;
  },

  getAvgSuccessRate: async (countDays: number = 30): Promise<{ rate: number | null; prevRate: number | null }> => {
    const response = await axios.get(`http://localhost:3001/dashboard/avg-success-rate`, { params: { countDays } });
    return response.data;
  },

  getTopUsers: async (countDays: number = 30): Promise<{ name: string; count: number }[]> => {
    const response = await axios.get(`http://localhost:3001/dashboard/top-users`, { params: { countDays } });
    return response.data;
  },
};
