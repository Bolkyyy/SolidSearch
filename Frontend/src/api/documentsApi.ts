import axios from 'axios';

export interface Document {
  "id": number,
  "collection_id":number,
  "title": string,
  "document_type": string,
  "archive_number": string,
  "document_date": string,
  "author_name":string,
  "status": string,
  "language": string,
  "created_at":string
}

export const DocumentsApi = {
  getById: async (id: number): Promise<Document> => {
    const { data } = await axios.get(`http://localhost:3001/documents/${id}`);
    return data;
  },
};