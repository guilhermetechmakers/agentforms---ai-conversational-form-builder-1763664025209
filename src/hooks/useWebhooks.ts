import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { webhooksApi } from '@/api/webhooks';
import { toast } from 'sonner';
import type { UpdateWebhookInput, WebhookFilter } from '@/types/webhook';

// Query keys
export const webhookKeys = {
  all: ['webhooks'] as const,
  lists: () => [...webhookKeys.all, 'list'] as const,
  list: (filters?: WebhookFilter) => [...webhookKeys.lists(), { filters }] as const,
  details: () => [...webhookKeys.all, 'detail'] as const,
  detail: (id: string) => [...webhookKeys.details(), id] as const,
  byAgent: (agentId: string) => [...webhookKeys.all, 'agent', agentId] as const,
  deliveryLogs: (webhookId: string) => [...webhookKeys.detail(webhookId), 'delivery-logs'] as const,
  deadLetterQueue: (webhookId?: string) => [...webhookKeys.all, 'dead-letter-queue', webhookId] as const,
};

// Get all webhooks with filters
export const useWebhooks = (filters?: WebhookFilter) => {
  return useQuery({
    queryKey: webhookKeys.list(filters),
    queryFn: () => webhooksApi.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get webhook by ID
export const useWebhook = (id: string) => {
  return useQuery({
    queryKey: webhookKeys.detail(id),
    queryFn: () => webhooksApi.getById(id),
    enabled: !!id,
  });
};

// Get webhooks by agent ID
export const useWebhooksByAgent = (agentId: string) => {
  return useQuery({
    queryKey: webhookKeys.byAgent(agentId),
    queryFn: () => webhooksApi.getByAgentId(agentId),
    enabled: !!agentId,
  });
};

// Create webhook mutation
export const useCreateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: webhooksApi.create,
    onSuccess: (newWebhook) => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
      queryClient.invalidateQueries({ queryKey: webhookKeys.byAgent(newWebhook.agent_id) });
      queryClient.setQueryData(webhookKeys.detail(newWebhook.id), newWebhook);
      toast.success('Webhook created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create webhook: ${error.message}`);
    },
  });
};

// Update webhook mutation
export const useUpdateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateWebhookInput }) =>
      webhooksApi.update(id, updates),
    onSuccess: (updatedWebhook) => {
      queryClient.setQueryData(webhookKeys.detail(updatedWebhook.id), updatedWebhook);
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
      queryClient.invalidateQueries({ queryKey: webhookKeys.byAgent(updatedWebhook.agent_id) });
      toast.success('Webhook updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update webhook: ${error.message}`);
    },
  });
};

// Delete webhook mutation
export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: webhooksApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: webhookKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
      toast.success('Webhook deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete webhook: ${error.message}`);
    },
  });
};

// Test webhook mutation
export const useTestWebhook = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: Record<string, any> }) =>
      webhooksApi.test(id, payload),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Webhook test successful!');
      } else {
        toast.error(`Webhook test failed: ${result.error_message || 'Unknown error'}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to test webhook: ${error.message}`);
    },
  });
};

// Get delivery logs
export const useDeliveryLogs = (webhookId: string, filters?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: [...webhookKeys.deliveryLogs(webhookId), filters],
    queryFn: () => webhooksApi.getDeliveryLogs(webhookId, filters),
    enabled: !!webhookId,
  });
};

// Get dead-letter queue
export const useDeadLetterQueue = (webhookId?: string) => {
  return useQuery({
    queryKey: webhookKeys.deadLetterQueue(webhookId),
    queryFn: () => webhooksApi.getDeadLetterQueue(webhookId),
  });
};

// Retry delivery mutation
export const useRetryDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: webhooksApi.retryDelivery,
    onSuccess: () => {
      // Invalidate delivery logs queries
      queryClient.invalidateQueries({ queryKey: webhookKeys.all });
      toast.success('Delivery retry initiated!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to retry delivery: ${error.message}`);
    },
  });
};

// Retry dead-letter entry mutation
export const useRetryDeadLetterEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: webhooksApi.retryDeadLetterEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.deadLetterQueue() });
      toast.success('Dead-letter entry retry initiated!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to retry dead-letter entry: ${error.message}`);
    },
  });
};

// Delete dead-letter entry mutation
export const useDeleteDeadLetterEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: webhooksApi.deleteDeadLetterEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.deadLetterQueue() });
      toast.success('Dead-letter entry deleted!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete dead-letter entry: ${error.message}`);
    },
  });
};
