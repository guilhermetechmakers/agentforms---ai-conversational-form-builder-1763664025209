import { api } from '@/lib/api';
import type {
  AdminUser,
  UpdateUserRoleInput,
  InviteUserInput,
  UsageAnalytics,
  SystemAlert,
  AlertFilter,
  ResolveAlertInput,
  AuditLogFilter,
  AuditLogResponse,
} from '@/types/admin';

export const adminApi = {
  // User Management
  getUsers: async (): Promise<AdminUser[]> => {
    return api.get<AdminUser[]>('/admin/users');
  },

  updateUserRole: async (input: UpdateUserRoleInput): Promise<AdminUser> => {
    return api.patch<AdminUser>(`/admin/users/${input.user_id}/role`, {
      role: input.role,
    });
  },

  deactivateUser: async (userId: string): Promise<void> => {
    return api.post<void>(`/admin/users/${userId}/deactivate`, {});
  },

  activateUser: async (userId: string): Promise<void> => {
    return api.post<void>(`/admin/users/${userId}/activate`, {});
  },

  inviteUser: async (input: InviteUserInput): Promise<AdminUser> => {
    return api.post<AdminUser>('/admin/users/invite', input);
  },

  // Analytics
  getUsageAnalytics: async (dateFrom?: string, dateTo?: string): Promise<UsageAnalytics> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    const query = params.toString();
    return api.get<UsageAnalytics>(`/admin/analytics${query ? `?${query}` : ''}`);
  },

  // System Alerts
  getAlerts: async (filter?: AlertFilter): Promise<SystemAlert[]> => {
    const params = new URLSearchParams();
    if (filter?.type) params.append('type', filter.type);
    if (filter?.severity) params.append('severity', filter.severity);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.date_from) params.append('date_from', filter.date_from);
    if (filter?.date_to) params.append('date_to', filter.date_to);
    const query = params.toString();
    return api.get<SystemAlert[]>(`/admin/alerts${query ? `?${query}` : ''}`);
  },

  acknowledgeAlert: async (alertId: string): Promise<SystemAlert> => {
    return api.post<SystemAlert>(`/admin/alerts/${alertId}/acknowledge`, {});
  },

  resolveAlert: async (input: ResolveAlertInput): Promise<SystemAlert> => {
    return api.post<SystemAlert>(`/admin/alerts/${input.alert_id}/resolve`, {
      comment: input.comment,
    });
  },

  // Audit Logs
  getAuditLogs: async (filter?: AuditLogFilter): Promise<AuditLogResponse> => {
    const params = new URLSearchParams();
    if (filter?.action_type) params.append('action_type', filter.action_type);
    if (filter?.user_id) params.append('user_id', filter.user_id);
    if (filter?.date_from) params.append('date_from', filter.date_from);
    if (filter?.date_to) params.append('date_to', filter.date_to);
    if (filter?.search) params.append('search', filter.search);
    if (filter?.page) params.append('page', filter.page.toString());
    if (filter?.limit) params.append('limit', filter.limit.toString());
    const query = params.toString();
    return api.get<AuditLogResponse>(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },
};
