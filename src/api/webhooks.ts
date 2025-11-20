import { api } from '@/lib/api';
import type {
  WebhookConfig,
  CreateWebhookInput,
  UpdateWebhookInput,
  DeliveryLog,
  DeadLetterQueueEntry,
  WebhookTestResult,
  WebhookFilter,
} from '@/types/webhook';

export const webhooksApi = {
  // Get all webhooks with filters
  getAll: async (filters?: WebhookFilter): Promise<{ data: WebhookConfig[]; count: number; page: number; limit: number }> => {
    const params = new URLSearchParams();
    if (filters?.agent_id) params.append('agent_id', filters.agent_id);
    if (filters?.enabled !== undefined) params.append('enabled', filters.enabled.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString();
    return api.get(`/webhooks${query ? `?${query}` : ''}`);
  },

  // Get webhook by ID
  getById: async (id: string): Promise<WebhookConfig> => {
    return api.get<WebhookConfig>(`/webhooks/${id}`);
  },

  // Get webhooks by agent ID
  getByAgentId: async (agentId: string): Promise<WebhookConfig[]> => {
    return webhooksApi.getAll({ agent_id: agentId }).then(res => res.data);
  },

  // Create new webhook
  create: async (webhook: CreateWebhookInput): Promise<WebhookConfig> => {
    return api.post<WebhookConfig>('/webhooks', webhook);
  },

  // Update webhook
  update: async (id: string, updates: UpdateWebhookInput): Promise<WebhookConfig> => {
    return api.put<WebhookConfig>(`/webhooks/${id}`, updates);
  },

  // Partial update webhook
  patch: async (id: string, updates: Partial<UpdateWebhookInput>): Promise<WebhookConfig> => {
    return api.patch<WebhookConfig>(`/webhooks/${id}`, updates);
  },

  // Delete webhook
  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/webhooks/${id}`);
  },

  // Test webhook delivery
  test: async (id: string, samplePayload?: Record<string, any>): Promise<WebhookTestResult> => {
    return api.post<WebhookTestResult>(`/webhooks/${id}/test`, { payload: samplePayload });
  },

  // Get delivery logs for a webhook
  getDeliveryLogs: async (webhookId: string, filters?: { page?: number; limit?: number; status?: string }): Promise<{ data: DeliveryLog[]; count: number }> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    
    const query = params.toString();
    return api.get(`/webhooks/${webhookId}/delivery-logs${query ? `?${query}` : ''}`);
  },

  // Get delivery logs for a session
  getSessionDeliveryLogs: async (sessionId: string): Promise<DeliveryLog[]> => {
    return api.get<DeliveryLog[]>(`/sessions/${sessionId}/webhook-logs`);
  },

  // Get dead-letter queue entries
  getDeadLetterQueue: async (webhookId?: string): Promise<DeadLetterQueueEntry[]> => {
    const params = new URLSearchParams();
    if (webhookId) params.append('webhook_id', webhookId);
    
    const query = params.toString();
    return api.get(`/webhooks/dead-letter-queue${query ? `?${query}` : ''}`);
  },

  // Retry failed delivery
  retryDelivery: async (deliveryLogId: string): Promise<void> => {
    return api.post(`/webhooks/delivery-logs/${deliveryLogId}/retry`, {});
  },

  // Retry dead-letter queue entry
  retryDeadLetterEntry: async (entryId: string): Promise<void> => {
    return api.post(`/webhooks/dead-letter-queue/${entryId}/retry`, {});
  },

  // Delete dead-letter queue entry
  deleteDeadLetterEntry: async (entryId: string): Promise<void> => {
    return api.delete(`/webhooks/dead-letter-queue/${entryId}`);
  },
};
