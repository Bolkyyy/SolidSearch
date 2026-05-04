import axios from 'axios';

export interface HistoryItem {
  id: number;
  query_text: string;
  created_at: string; 
  user_id: number;
}

export const historyApi = {
  getByUserId: async (userId: number): Promise<HistoryItem[]> => {
    const { data } = await axios.get(`http://localhost:3001/history/${userId}`);
    return data;
  },
};