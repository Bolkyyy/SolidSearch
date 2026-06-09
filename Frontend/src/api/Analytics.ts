import axios from 'axios';

export interface QueryStat {
  count: number;
  date: Date;
}

export const analyticsApi = {
  getSearchAnalytics: async (countDays: number = 30): Promise<QueryStat[]> => {
    const response = await axios.get(`http://localhost:3001/dashboard/search-analytics`, {
      params: { countDays }
    });
    return response.data;
  },
};
