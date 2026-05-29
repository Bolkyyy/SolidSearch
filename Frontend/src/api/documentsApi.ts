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
  getAll: async (): Promise<Document[]> => {
    const { data } = await axios.get(`${BASE}/documents`);
    return data;
  },

  getByCollectionId: async (collectionId: number): Promise<Document[]> => {
    const { data } = await axios.get(
      `${BASE}/documents?collection_id=${collectionId}`,
    );
    return data;
  },

  getById: async (id: number): Promise<Document> => {
    const { data } = await axios.get(`${BASE}/documents/${id}`);
    return data;
  },

  addToCollection: async (
    documentId: number,
    collectionId: number,
  ): Promise<Document> => {
    const { data } = await axios.post(
      `${BASE}/documents/${documentId}/add-to-collection`,
      { collection_id: collectionId },
    );
    return data;
  },
};