import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '@/api/sessions';
import { toast } from 'sonner';
import type { SessionFilter } from '@/types/session';

// Query keys
export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (filters: SessionFilter) => [...sessionKeys.lists(), filters] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
  byAgent: (agentId: string) => [...sessionKeys.all, 'agent', agentId] as const,
};

// Get all sessions with filters
export const useSessions = (filters?: SessionFilter) => {
  return useQuery({
    queryKey: sessionKeys.list(filters || {}),
    queryFn: () => sessionsApi.getAll(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get session by ID
export const useSession = (id: string) => {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () => sessionsApi.getById(id),
    enabled: !!id,
  });
};

// Get sessions by agent ID
export const useSessionsByAgent = (agentId: string, filters?: Omit<SessionFilter, 'agent_id'>) => {
  return useQuery({
    queryKey: [...sessionKeys.byAgent(agentId), filters],
    queryFn: () => sessionsApi.getByAgentId(agentId, filters),
    enabled: !!agentId,
    staleTime: 1000 * 60 * 2,
  });
};

// Delete session mutation
export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionsApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: sessionKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      toast.success('Session deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete session: ${error.message}`);
    },
  });
};

// Bulk delete sessions mutation
export const useBulkDeleteSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionsApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      toast.success('Sessions deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete sessions: ${error.message}`);
    },
  });
};

// Resend webhook mutation
export const useResendWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, webhookLogId }: { sessionId: string; webhookLogId: string }) =>
      sessionsApi.resendWebhook(sessionId, webhookLogId),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) });
      toast.success('Webhook resent successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to resend webhook: ${error.message}`);
    },
  });
};

// Update captured data mutation
export const useUpdateCapturedData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: Record<string, any> }) =>
      sessionsApi.updateCapturedData(sessionId, data),
    onSuccess: (updatedSession, { sessionId }) => {
      queryClient.setQueryData(sessionKeys.detail(sessionId), updatedSession);
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) });
      toast.success('Captured data updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update data: ${error.message}`);
    },
  });
};

// Mark session as reviewed mutation
export const useMarkSessionReviewed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => sessionsApi.markReviewed(sessionId),
    onSuccess: (updatedSession, sessionId) => {
      queryClient.setQueryData(sessionKeys.detail(sessionId), updatedSession);
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      toast.success('Session marked as reviewed!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark session as reviewed: ${error.message}`);
    },
  });
};

// Bulk resend webhooks mutation
export const useBulkResendWebhooks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionIds: string[]) => sessionsApi.bulkResendWebhooks(sessionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      toast.success('Webhooks resent successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to resend webhooks: ${error.message}`);
    },
  });
};
