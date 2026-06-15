import axios from "axios";

const BASE = "http://localhost:3001";

export interface Collection {
  id: number;
  name: string;
  description: string;
  code: string;
  is_active: boolean;
  source_id: number;
}

export const collectionsApi = {
  getAll: async (): Promise<Collection[]> => {
    const { data } = await axios.get(`${BASE}/document_collection`);
    return data;
  },

  create: async (name: string, description: string): Promise<Collection> => {
    const code = (name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || "collection") + "_" + Date.now();
    const { data } = await axios.post(`${BASE}/document_collection`, { name, description, code, is_active: true, source_id: 1 });
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${BASE}/document_collection/${id}`);
  },

  setActive: async (id: number, is_active: boolean): Promise<void> => {
    await axios.patch(`${BASE}/document_collection/${id}`, { is_active });
  },
};
