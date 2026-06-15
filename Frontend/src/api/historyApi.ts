import axios from "axios";

const BASE = "http://localhost:3001";

export interface HistoryItem {
  id: number;
  query_text: string;
  created_at: string;
  user_id: number;
  status?: string | null;
  result_count?: number | null;
  filters_json?: { period?: string; source?: string; format?: string } | null;
}

export interface RecentActivityItem {
  id: number;
  user_id: number;
  query_text: string;
  query_type: string;
  result_count: number | null;
  created_at: string;
}

export const historyApi = {
  getByUserId: async (userId: number): Promise<HistoryItem[]> => {
    const { data } = await axios.get(`${BASE}/history/${userId}`);
    return data;
  },

  getRecent: async (limit: number): Promise<RecentActivityItem[]> => {
    const { data } = await axios.get(`${BASE}/history/recent?limit=${limit}`);
    return data;
  },

  clearHistory: async (userId: number): Promise<void> => {
    await axios.delete(`${BASE}/history/user/${userId}`);
  },

  deleteItem: async (id: number): Promise<void> => {
    await axios.delete(`${BASE}/history/item/${id}`);
  },
};
