import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeApi } from '@/api/knowledge';
import { toast } from 'sonner';
import type {
  RetrievalQuery,
  UploadDocumentInput,
  ReindexInput,
} from '@/types/knowledge';

// Query keys
export const knowledgeKeys = {
  all: ['knowledge'] as const,
  documents: () => [...knowledgeKeys.all, 'documents'] as const,
  document: (id: string) => [...knowledgeKeys.documents(), id] as const,
  search: (query: string) => [...knowledgeKeys.all, 'search', query] as const,
  stats: () => [...knowledgeKeys.all, 'stats'] as const,
  status: (id: string) => [...knowledgeKeys.all, 'status', id] as const,
  chunks: (id: string) => [...knowledgeKeys.all, 'chunks', id] as const,
};

// Get all documents
export const useKnowledgeDocuments = () => {
  return useQuery({
    queryKey: knowledgeKeys.documents(),
    queryFn: knowledgeApi.getAllDocuments,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get document by ID
export const useKnowledgeDocument = (id: string) => {
  return useQuery({
    queryKey: knowledgeKeys.document(id),
    queryFn: () => knowledgeApi.getDocumentById(id),
    enabled: !!id,
  });
};

// Search knowledge
export const useKnowledgeSearch = (query: RetrievalQuery, enabled = false) => {
  return useQuery({
    queryKey: knowledgeKeys.search(query.query),
    queryFn: () => knowledgeApi.search(query),
    enabled: enabled && !!query.query && query.query.trim().length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get indexing status
export const useIndexingStatus = (documentId: string, enabled = true) => {
  return useQuery({
    queryKey: knowledgeKeys.status(documentId),
    queryFn: () => knowledgeApi.getIndexingStatus(documentId),
    enabled: enabled && !!documentId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'indexing' || data?.status === 'pending') {
        return 2000; // Poll every 2 seconds while indexing
      }
      return false; // Don't poll when completed or error
    },
  });
};

// Get document chunks
export const useDocumentChunks = (documentId: string) => {
  return useQuery({
    queryKey: knowledgeKeys.chunks(documentId),
    queryFn: () => knowledgeApi.getDocumentChunks(documentId),
    enabled: !!documentId,
  });
};

// Get knowledge stats
export const useKnowledgeStats = () => {
  return useQuery({
    queryKey: knowledgeKeys.stats(),
    queryFn: knowledgeApi.getStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Upload document mutation
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, chunking_enabled, chunk_size, chunk_overlap }: UploadDocumentInput) =>
      knowledgeApi.uploadDocument(file, {
        chunking_enabled,
        chunk_size,
        chunk_overlap,
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.documents() });
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.stats() });
      queryClient.setQueryData(knowledgeKeys.document(response.document.id), response.document);
      toast.success('Document uploaded successfully! Indexing in progress...');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });
};

// Delete document mutation
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: knowledgeApi.deleteDocument,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: knowledgeKeys.document(deletedId) });
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.documents() });
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.stats() });
      toast.success('Document deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });
};

// Re-index document mutation
export const useReindexDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReindexInput) => knowledgeApi.reindexDocument(input),
    onSuccess: (_status, variables) => {
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.document(variables.document_id) });
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.status(variables.document_id) });
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.documents() });
      toast.success('Re-indexing started! This may take a few moments...');
    },
    onError: (error: Error) => {
      toast.error(`Failed to re-index document: ${error.message}`);
    },
  });
};
