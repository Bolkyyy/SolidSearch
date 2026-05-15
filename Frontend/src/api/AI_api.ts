import axios from 'axios';

export interface AiSettings {
  id: number;
  provider_code: string;
  model_name: string;
  api_key: string;
  base_url: string;
  is_active: boolean;
  updated_at: string;
}

export interface UpdateAiSettingsDto {
  provider_code?: string;
  model_name?: string;
  api_key?: string;
  base_url?: string;
  is_active?: boolean;
}

export interface AiProvider {
  code: string;
  name: string;
  base_url: string;
  models: string[];
}

export interface SearchResponse {
  answer: string;
}


export const aiApi = {
  getAiSettings: async (): Promise<AiSettings[]> => {
    const response = await axios.get(`http://localhost:3001/settings/ai`);
    return response.data;
  },

  saveAiSettings: async (dto: UpdateAiSettingsDto): Promise<void> => {
    const response = await axios.put(`http://localhost:3001/settings/ai`, dto);
    return response.data;
  },

  createAiSettings: async (dto: UpdateAiSettingsDto): Promise<AiSettings> => {
    const response = await axios.post(`http://localhost:3001/settings/ai`, dto);
    return response.data;
  },

  getAiProviders: async (): Promise<AiProvider[]> => {
    const response = await axios.get(`http://localhost:3001/settings/ai/providers`);
    return response.data;
  },

  search: async (query: string): Promise<SearchResponse> => {
    const response = await axios.post(`http://localhost:3001/search`, { query });
    return response.data;
  },

  getAnswer: async (id: number): Promise<any> => {
    const response = await axios.get(`http://localhost:3001/search/${id}/answer`);
    return response.data;
  },
  
};