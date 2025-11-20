import { api } from '@/lib/api';
import type {
  KnowledgeDocument,
  RetrievalQuery,
  RetrievalResponse,
  UploadDocumentResponse,
  IndexingStatus,
  ReindexInput,
  KnowledgeStats,
} from '@/types/knowledge';

export const knowledgeApi = {
  // Get all documents
  getAllDocuments: async (): Promise<KnowledgeDocument[]> => {
    return api.get<KnowledgeDocument[]>('/knowledge/documents');
  },

  // Get document by ID
  getDocumentById: async (id: string): Promise<KnowledgeDocument> => {
    return api.get<KnowledgeDocument>(`/knowledge/documents/${id}`);
  },

  // Upload document
  uploadDocument: async (
    file: File,
    options?: {
      chunking_enabled?: boolean;
      chunk_size?: number;
      chunk_overlap?: number;
    }
  ): Promise<UploadDocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.chunking_enabled !== undefined) {
      formData.append('chunking_enabled', String(options.chunking_enabled));
    }
    if (options?.chunk_size) {
      formData.append('chunk_size', String(options.chunk_size));
    }
    if (options?.chunk_overlap) {
      formData.append('chunk_overlap', String(options.chunk_overlap));
    }

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/knowledge/documents/upload`;
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      const error = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json() as Promise<UploadDocumentResponse>;
  },

  // Delete document
  deleteDocument: async (id: string): Promise<void> => {
    return api.delete<void>(`/knowledge/documents/${id}`);
  },

  // Search/Retrieve knowledge
  search: async (query: RetrievalQuery): Promise<RetrievalResponse> => {
    return api.post<RetrievalResponse>('/knowledge/search', query);
  },

  // Get indexing status
  getIndexingStatus: async (documentId: string): Promise<IndexingStatus> => {
    return api.get<IndexingStatus>(`/knowledge/documents/${documentId}/status`);
  },

  // Re-index document
  reindexDocument: async (input: ReindexInput): Promise<IndexingStatus> => {
    return api.post<IndexingStatus>(`/knowledge/documents/${input.document_id}/reindex`, {
      chunk_size: input.chunk_size,
      chunk_overlap: input.chunk_overlap,
      force: input.force,
    });
  },

  // Get knowledge stats
  getStats: async (): Promise<KnowledgeStats> => {
    return api.get<KnowledgeStats>('/knowledge/stats');
  },

  // Get document chunks
  getDocumentChunks: async (documentId: string): Promise<{ chunks: Array<{ id: string; content: string; chunk_index: number; created_at: string }> }> => {
    return api.get<{ chunks: Array<{ id: string; content: string; chunk_index: number; created_at: string }> }>(
      `/knowledge/documents/${documentId}/chunks`
    );
  },
};
