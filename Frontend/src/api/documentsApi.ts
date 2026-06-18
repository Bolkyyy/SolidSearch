import axios from "axios";

const BASE = "http://localhost:3001";

export interface DocumentFile {
  id: number;
  document_id: number;
  file_name: string;
  file_type: string;
  file_path: string;
  file_size: number;
  page_count: number;
  extracted_text: string;
  normalized_text: string;
  extraction_status: string;
  uploaded_at: string;
}

export interface Document {
  id: number;
  collection_id: number;
  title: string;
  document_type: string;
  archive_number: string;
  document_date: string;
  author_name: string;
  status: string;
  language: string;
  created_at: string;
  files: DocumentFile[];
}

export interface PaginatedDocuments {
  data: Document[];
  total: number;
}

export interface CollectionStats {
  total: number;
  processed: number;
  processing: number;
  failed: number;
  types: string[];
}

export interface IndexingConfig {
  chunkSize: number;
  chunkMaxTokens: number;
  maxStoredChars: number;
  maxAiChars: number;
}

export const documentsApi = {
  getAll: async (userId?: number): Promise<Document[]> => {
    const params = userId ? `?user_id=${userId}` : '';
    const { data } = await axios.get(`${BASE}/documents${params}`);
    return data;
  },

  getRecent: async (limit: number): Promise<Document[]> => {
    const { data } = await axios.get(`${BASE}/documents?limit=${limit}`);
    return data;
  },

  getAllPaginated: async (
    page = 1,
    limit = 10,
    search?: string,
    sort?: string,
    dir?: string,
    docType?: string,
    date?: string,
  ): Promise<PaginatedDocuments> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search?.trim()) params.set('search', search.trim());
    if (sort) params.set('sort', sort);
    if (dir) params.set('dir', dir);
    if (docType && docType !== 'all') params.set('type', docType);
    if (date?.trim()) params.set('date', date.trim());
    const { data } = await axios.get(`${BASE}/documents?${params}`);
    return data;
  },

  getAllStats: async (): Promise<CollectionStats> => {
    const { data } = await axios.get(`${BASE}/documents/stats`);
    return data;
  },

  getByCollectionId: async (
    collectionId: number,
    page = 1,
    limit = 20,
    search?: string,
    docType?: string,
  ): Promise<PaginatedDocuments> => {
    const params = new URLSearchParams({ collection_id: String(collectionId), page: String(page), limit: String(limit) });
    if (search?.trim()) params.set('search', search.trim());
    if (docType && docType !== 'all') params.set('type', docType);
    const { data } = await axios.get(`${BASE}/documents?${params}`);
    return data;
  },

  getCollectionStats: async (collectionId: number): Promise<CollectionStats> => {
    const { data } = await axios.get(`${BASE}/documents/stats?collection_id=${collectionId}`);
    return data;
  },

  getById: async (id: number): Promise<Document> => {
    const { data } = await axios.get(`${BASE}/documents/${id}`);
    return data;
  },

  getJobs: async (id: number): Promise<any[]> => {
    const { data } = await axios.get(`${BASE}/documents/${id}/jobs`);
    return data;
  },

  collectionSizes: async (): Promise<{ collection_id: number; total_size: number }[]> => {
    const { data } = await axios.get(`${BASE}/documents/sizes`);
    return data;
  },

  addToCollection: async (documentId: number, collectionId: number): Promise<Document> => {
    const { data } = await axios.post(`${BASE}/documents/${documentId}/add-to-collection`, { collection_id: collectionId });
    return data;
  },

  upload: async (file: File, userId?: number, signal?: AbortSignal): Promise<void> => {
    const fd = new FormData();
    fd.append("file", file);
    if (userId) fd.append("user_id", String(userId));
    await axios.post(`${BASE}/documents/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
    });
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${BASE}/documents/${id}`);
  },

  reindexDocument: async (id: number): Promise<void> => {
    await axios.post(`${BASE}/documents/${id}/extract-text`);
  },

  reindexCollection: async (collectionId: number): Promise<void> => {
    await axios.post(`${BASE}/documents/extract-collection/${collectionId}`);
  },

  cancelReindex: async (collectionId: number): Promise<void> => {
    await axios.post(`${BASE}/documents/extract-collection/${collectionId}/cancel`);
  },

  reindexStatus: async (collectionId: number): Promise<{ active: boolean }> => {
    const { data } = await axios.get(`${BASE}/documents/extract-collection/${collectionId}/status`);
    return data;
  },

  getIndexingConfig: async (): Promise<IndexingConfig> => {
    const { data } = await axios.get(`${BASE}/documents/indexing-config`);
    return data;
  },

  updateIndexingConfig: async (config: Partial<IndexingConfig>): Promise<IndexingConfig> => {
    const { data } = await axios.put(`${BASE}/documents/indexing-config`, config);
    return data;
  },
};
