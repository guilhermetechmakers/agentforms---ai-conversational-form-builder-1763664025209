import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { toast } from 'sonner';
import type {
  AlertFilter,
  AuditLogFilter,
} from '@/types/admin';

// Query keys
export const adminKeys = {
  all: ['admin'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  analytics: (dateFrom?: string, dateTo?: string) => 
    [...adminKeys.all, 'analytics', { dateFrom, dateTo }] as const,
  alerts: (filter?: AlertFilter) => 
    [...adminKeys.all, 'alerts', filter] as const,
  auditLogs: (filter?: AuditLogFilter) => 
    [...adminKeys.all, 'audit-logs', filter] as const,
};

// User Management Hooks
export const useAdminUsers = () => {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: adminApi.getUsers,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.auditLogs() });
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.auditLogs() });
      toast.success('User deactivated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to deactivate user');
    },
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.auditLogs() });
      toast.success('User activated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to activate user');
    },
  });
};

export const useInviteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.inviteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.auditLogs() });
      toast.success('User invitation sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation');
    },
  });
};

// Analytics Hooks
export const useUsageAnalytics = (dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: adminKeys.analytics(dateFrom, dateTo),
    queryFn: () => adminApi.getUsageAnalytics(dateFrom, dateTo),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
};

// System Alerts Hooks
export const useSystemAlerts = (filter?: AlertFilter) => {
  return useQuery({
    queryKey: adminKeys.alerts(filter),
    queryFn: () => adminApi.getAlerts(filter),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60 * 1, // Refetch every minute for real-time alerts
  });
};

export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.acknowledgeAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.alerts() });
      toast.success('Alert acknowledged');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to acknowledge alert');
    },
  });
};

export const useResolveAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.resolveAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.alerts() });
      queryClient.invalidateQueries({ queryKey: adminKeys.auditLogs() });
      toast.success('Alert resolved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resolve alert');
    },
  });
};

// Audit Logs Hooks
export const useAuditLogs = (filter?: AuditLogFilter) => {
  return useQuery({
    queryKey: adminKeys.auditLogs(filter),
    queryFn: () => adminApi.getAuditLogs(filter),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
