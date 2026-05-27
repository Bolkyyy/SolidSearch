export interface SearchDocument {
  id: number;
  title: string;
  document_type: string;
  archive_number: string;
  document_date: string;
  author_name: string;
  status: string;
  language: string;
  created_at: string;
  files?: {
    id: number;
    normalized_text: string;
    extraction_status: string;
  }[];
}

export interface SearchResult {
  answer: string;
  fromCache: boolean;
  documentIds: number[];
  documents: SearchDocument[];
}
