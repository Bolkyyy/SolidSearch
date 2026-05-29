import axios from "axios";

export interface HistoryItem {
  id: number;
  query_text: string;
  created_at: string;
  user_id: number;
  status?: string | null;
  result_count?: number | null;
}

export const historyApi = {
  getByUserId: async (userId: number): Promise<HistoryItem[]> => {
    const { data } = await axios.get(`http://localhost:3001/history/${userId}`);
    return data;
  },

  clearHistory: async (userId: number): Promise<void> => {
    await axios.delete(`http://localhost:3001/history/user/${userId}`);
  },

  deleteItem: async (id: number): Promise<void> => {
    await axios.delete(`http://localhost:3001/history/item/${id}`);
  },
};
