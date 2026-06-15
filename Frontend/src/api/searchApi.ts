import axios from "axios";

const BASE = "http://localhost:3001";

export interface HistoryItem {
  id: number;
  query_text: string;
  created_at: string;
  user_id: number;
}

export interface CachedSearchResult {
  answer: string;
  documents: any[];
}

export const historyApi = {
  getByUserId: async (userId: number): Promise<HistoryItem[]> => {
    const { data } = await axios.get(`${BASE}/history/${userId}`);
    return data;
  },
};

export const searchQueriesApi = {
  save: async (userId: number, queryText: string): Promise<void> => {
    await axios.post(`${BASE}/search-queries`, { user_id: userId, query_text: queryText });
  },
};

export const searchApi = {
  getCached: async (
    query: string,
    userId: number,
    filters: object,
    signal: AbortSignal,
  ): Promise<CachedSearchResult | null> => {
    const filtersParam = encodeURIComponent(JSON.stringify(filters));
    const res = await fetch(
      `${BASE}/search/cached?query=${encodeURIComponent(query)}&userId=${userId}&filters=${filtersParam}`,
      { signal },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.answer && !data?.documents?.length) return null;
    return data;
  },

  stream: async (
    query: string,
    userId: number,
    filters: object,
    signal: AbortSignal,
  ): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
    const response = await fetch(`${BASE}/search/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, userId, filters }),
      signal,
    });
    return response.body!.getReader();
  },
};
