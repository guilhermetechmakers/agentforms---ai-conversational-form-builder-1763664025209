import { api } from '@/lib/api';
import type { 
  Session, 
  SessionFilter, 
  SessionCreateRequest, 
  SessionStateUpdate,
  RetentionPolicy 
} from '@/types/session';

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

  // Create new session
  create: async (data: SessionCreateRequest): Promise<Session> => {
    return api.post<Session>('/sessions', data);
  },

  // Update session state (pause, resume, terminate)
  updateState: async (sessionId: string, stateUpdate: SessionStateUpdate): Promise<Session> => {
    return api.patch<Session>(`/sessions/${sessionId}/state`, stateUpdate);
  },

  // Pause session
  pause: async (sessionId: string, reason?: string): Promise<Session> => {
    return sessionsApi.updateState(sessionId, { state: 'paused', reason });
  },

  // Resume session
  resume: async (sessionId: string): Promise<Session> => {
    return sessionsApi.updateState(sessionId, { state: 'running' });
  },

  // Terminate session
  terminate: async (sessionId: string, reason?: string): Promise<Session> => {
    return sessionsApi.updateState(sessionId, { state: 'stopped', reason });
  },

  // Get retention policy for session
  getRetentionPolicy: async (sessionId: string): Promise<RetentionPolicy> => {
    return api.get<RetentionPolicy>(`/sessions/${sessionId}/retention-policy`);
  },

  // Update retention policy for session
  updateRetentionPolicy: async (sessionId: string, policy: Partial<RetentionPolicy>): Promise<RetentionPolicy> => {
    return api.patch<RetentionPolicy>(`/sessions/${sessionId}/retention-policy`, policy);
  },

  // Get retention policies for agent
  getAgentRetentionPolicies: async (agentId: string): Promise<RetentionPolicy[]> => {
    return api.get<RetentionPolicy[]>(`/agents/${agentId}/retention-policies`);
  },
};
