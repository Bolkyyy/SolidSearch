import axios from "axios";

export interface HistoryItem {
  id: number;
  query_text: string;
  created_at: string;
  user_id: number;
}

const API_BASE = "http://localhost:3001";

export const historyApi = {
  getByUserId: async (userId: number): Promise<HistoryItem[]> => {
    const { data } = await axios.get(`${API_BASE}/history/${userId}`);
    return data;
  },
};

export const searchQueriesApi = {
  save: async (userId: number, queryText: string): Promise<void> => {
    await axios.post(`${API_BASE}/search-queries`, {
      user_id: userId,
      query_text: queryText,
    });
  },
};
