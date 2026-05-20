import axios from 'axios';

export interface DocumentFile {
  id: number;
  document_id: number;
  file_name: string;
  file_type: string;
  file_path: string;
  file_size: number;
  page_count: number;
  normalized_text: string;
}

export interface DocumentMetadata {
  id: number;
  document_id: number;
  contractor_name: string;
  contract_number: string;
  total_amount: number;
  responsible_person: string;
  extra_json: object | null;
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
  metadata: DocumentMetadata[];
}

export const DocumentsApi = {
  getById: async (id: number): Promise<Document> => {
    const { data } = await axios.get(`http://localhost:3001/documents/${id}`);
    return data;
  },
};