import { api } from '@/lib/api';
import type { Agent, CreateAgentInput, UpdateAgentInput, SchemaField } from '@/types/agent';

export const agentsApi = {
  // Get all agents
  getAll: async (): Promise<Agent[]> => {
    return api.get<Agent[]>('/agents');
  },

  // Get agent by ID
  getById: async (id: string): Promise<Agent> => {
    return api.get<Agent>(`/agents/${id}`);
  },

  // Get agent by slug (public)
  getBySlug: async (slug: string): Promise<Agent> => {
    return api.get<Agent>(`/agents/public/${slug}`);
  },

  // Create new agent
  create: async (agent: CreateAgentInput): Promise<Agent> => {
    return api.post<Agent>('/agents', agent);
  },

  // Update agent
  update: async (id: string, updates: UpdateAgentInput): Promise<Agent> => {
    return api.put<Agent>(`/agents/${id}`, updates);
  },

  // Partial update agent
  patch: async (id: string, updates: Partial<UpdateAgentInput>): Promise<Agent> => {
    return api.patch<Agent>(`/agents/${id}`, updates);
  },

  // Delete agent
  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/agents/${id}`);
  },

  // Duplicate agent
  duplicate: async (id: string): Promise<Agent> => {
    return api.post<Agent>(`/agents/${id}/duplicate`, {});
  },

  // Publish agent
  publish: async (id: string): Promise<Agent> => {
    return api.post<Agent>(`/agents/${id}/publish`, {});
  },

  // Unpublish agent
  unpublish: async (id: string): Promise<Agent> => {
    return api.post<Agent>(`/agents/${id}/unpublish`, {});
  },

  // Update schema only
  updateSchema: async (id: string, schema: SchemaField[]): Promise<Agent> => {
    return api.patch<Agent>(`/agents/${id}/schema`, { schema });
  },

  // Get schema validation preview
  validateSchema: async (id: string, schema: SchemaField[]): Promise<{ valid: boolean; errors: string[] }> => {
    return api.post<{ valid: boolean; errors: string[] }>(`/agents/${id}/schema/validate`, { schema });
  },
};

// Dashboard stats interface
export interface DashboardStats {
  total_agents: number;
  active_sessions_today: number;
  leads_collected_month: number;
}

export const statsApi = {
  // Get dashboard stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    return api.get<DashboardStats>('/dashboard/stats');
  },
};
