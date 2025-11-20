import { api } from '@/lib/api';
import type { Session, SessionFilter } from '@/types/session';

export const sessionsApi = {
  // Get all sessions with filters
  getAll: async (filters?: SessionFilter): Promise<{ data: Session[]; count: number; page: number; limit: number }> => {
    const params = new URLSearchParams();
    if (filters?.agent_id) params.append('agent_id', filters.agent_id);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString();
    return api.get(`/sessions${query ? `?${query}` : ''}`);
  },

  // Get session by ID
  getById: async (id: string): Promise<Session> => {
    return api.get<Session>(`/sessions/${id}`);
  },

  // Get sessions by agent ID
  getByAgentId: async (agentId: string, filters?: Omit<SessionFilter, 'agent_id'>): Promise<{ data: Session[]; count: number }> => {
    return sessionsApi.getAll({ ...filters, agent_id: agentId });
  },

  // Delete session
  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/sessions/${id}`);
  },

  // Bulk delete sessions
  bulkDelete: async (ids: string[]): Promise<void> => {
    return api.post('/sessions/bulk-delete', { ids });
  },

  // Export sessions
  export: async (filters?: SessionFilter, format: 'json' | 'csv' = 'json'): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters?.agent_id) params.append('agent_id', filters.agent_id);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    params.append('format', format);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/sessions/export?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  },

  // Resend webhook
  resendWebhook: async (sessionId: string, webhookLogId: string): Promise<void> => {
    return api.post(`/sessions/${sessionId}/webhooks/${webhookLogId}/retry`, {});
  },

  // Export single session
  exportSession: async (sessionId: string, format: 'json' | 'csv' = 'json'): Promise<Blob> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/sessions/${sessionId}/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  },

  // Update captured data
  updateCapturedData: async (sessionId: string, data: Record<string, any>): Promise<Session> => {
    return api.patch<Session>(`/sessions/${sessionId}/captured-data`, { data });
  },

  // Mark session as reviewed
  markReviewed: async (sessionId: string): Promise<Session> => {
    return api.patch<Session>(`/sessions/${sessionId}/reviewed`, {});
  },

  // Bulk resend webhooks
  bulkResendWebhooks: async (sessionIds: string[]): Promise<void> => {
    return api.post('/sessions/bulk-resend-webhooks', { session_ids: sessionIds });
  },
};
