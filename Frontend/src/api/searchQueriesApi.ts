import axios from 'axios';

const API_BASE = 'http://localhost:3001';

export const searchQueriesApi = {
  save: async (userId: number, queryText: string): Promise<void> => {
    await axios.post(`${API_BASE}/search-queries`, {
      user_id: userId,
      query_text: queryText,
    });
  },
};