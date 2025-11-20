export interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'text' | 'pdf' | 'markdown';
  file_url?: string;
  content?: string;
  uploaded_at: string;
  indexed_at?: string;
  status: 'pending' | 'indexing' | 'completed' | 'error';
  error_message?: string;
  chunk_count?: number;
  user_id: string;
}

export interface KnowledgeChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface RetrievalResult {
  chunk: KnowledgeChunk;
  document: KnowledgeDocument;
  similarity_score: number;
  metadata?: Record<string, unknown>;
}

export interface RetrievalQuery {
  query: string;
  top_k?: number;
  min_score?: number;
  document_ids?: string[];
}

export interface RetrievalResponse {
  results: RetrievalResult[];
  total_results: number;
  query_time_ms: number;
}

export interface UploadDocumentInput {
  file: File;
  chunking_enabled?: boolean;
  chunk_size?: number;
  chunk_overlap?: number;
}

export interface UploadDocumentResponse {
  document: KnowledgeDocument;
  upload_id: string;
}

export interface IndexingStatus {
  document_id: string;
  status: 'pending' | 'indexing' | 'completed' | 'error';
  progress?: number;
  chunks_processed?: number;
  total_chunks?: number;
  error_message?: string;
}

export interface ReindexInput {
  document_id: string;
  chunk_size?: number;
  chunk_overlap?: number;
  force?: boolean;
}

export interface KnowledgeStats {
  total_documents: number;
  total_chunks: number;
  indexing_in_progress: number;
  average_indexing_time_ms: number;
  retrieval_latency_ms: number;
}
