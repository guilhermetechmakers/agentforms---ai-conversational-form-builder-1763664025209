import type { User } from './auth';

// User Management Types
export interface AdminUser extends User {
  role: 'admin' | 'member' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  last_active_at?: string;
  workspace_id: string;
}

export interface UpdateUserRoleInput {
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface InviteUserInput {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  full_name?: string;
}

// Analytics Types
export interface UsageAnalytics {
  sessions: SessionAnalytics;
  tokens: TokenAnalytics;
  webhooks: WebhookAnalytics;
  agents: AgentAnalytics;
  date_range: {
    from: string;
    to: string;
  };
}

export interface SessionAnalytics {
  total: number;
  completed: number;
  abandoned: number;
  active: number;
  daily: DailyMetric[];
  completion_rate: number;
  average_duration_seconds: number;
}

export interface TokenAnalytics {
  total_used: number;
  average_per_session: number;
  daily: DailyMetric[];
  by_agent: AgentMetric[];
}

export interface WebhookAnalytics {
  total_attempts: number;
  successful: number;
  failed: number;
  success_rate: number;
  daily: DailyMetric[];
  by_agent: AgentMetric[];
}

export interface AgentAnalytics {
  total: number;
  published: number;
  draft: number;
  archived: number;
  adoption_rate: number;
  top_agents: AgentMetric[];
}

export interface DailyMetric {
  date: string;
  value: number;
}

export interface AgentMetric {
  agent_id: string;
  agent_name: string;
  value: number;
  percentage?: number;
}

// System Alerts Types
export interface SystemAlert {
  id: string;
  type: 'webhook_failure' | 'billing_alert' | 'abuse_report' | 'system_error' | 'usage_limit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  status: 'open' | 'acknowledged' | 'resolved';
  metadata?: Record<string, any>;
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  acknowledged_by?: string;
  resolved_by?: string;
}

export interface AlertFilter {
  type?: SystemAlert['type'];
  severity?: SystemAlert['severity'];
  status?: SystemAlert['status'];
  date_from?: string;
  date_to?: string;
}

export interface ResolveAlertInput {
  alert_id: string;
  comment?: string;
}

// Audit Logs Types
export interface AuditLog {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  action_type: 'user_role_change' | 'user_deactivation' | 'user_invitation' | 'billing_update' | 'agent_publish' | 'agent_delete' | 'settings_change' | 'security_event';
  action_description: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface AuditLogFilter {
  action_type?: AuditLog['action_type'];
  user_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
