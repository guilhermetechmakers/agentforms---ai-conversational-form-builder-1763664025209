import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/api/settings';
import { usersApi } from '@/api/users';
import { toast } from 'sonner';
import type {
  UpdateAccountInput,
  TeamMember,
  UpdateWebhookInput,
} from '@/types/settings';

// Query keys
export const settingsKeys = {
  workspace: ['settings', 'workspace'] as const,
  team: ['settings', 'team'] as const,
  subscription: ['settings', 'billing', 'subscription'] as const,
  usage: ['settings', 'billing', 'usage'] as const,
  invoices: ['settings', 'billing', 'invoices'] as const,
  paymentMethods: ['settings', 'billing', 'payment-methods'] as const,
  apiKeys: ['settings', 'integrations', 'api-keys'] as const,
  webhooks: ['settings', 'integrations', 'webhooks'] as const,
  connectedApps: ['settings', 'integrations', 'connected-apps'] as const,
  securitySessions: ['settings', 'security', 'sessions'] as const,
  allowedIPs: ['settings', 'security', 'allowed-ips'] as const,
};

// Workspace
export const useWorkspace = () => {
  return useQuery({
    queryKey: settingsKeys.workspace,
    queryFn: settingsApi.getWorkspace,
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updateWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.workspace });
      toast.success('Workspace updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update workspace: ${error.message || 'Unknown error'}`);
    },
  });
};

// Team & Roles
export const useTeamMembers = () => {
  return useQuery({
    queryKey: settingsKeys.team,
    queryFn: settingsApi.getTeamMembers,
  });
};

export const useInviteTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.inviteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.team });
      toast.success('Team member invited successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to invite team member: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useUpdateTeamMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: TeamMember['role'] }) =>
      settingsApi.updateTeamMemberRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.team });
      toast.success('Team member role updated');
    },
    onError: (error: any) => {
      toast.error(`Failed to update role: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.removeTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.team });
      toast.success('Team member removed');
    },
    onError: (error: any) => {
      toast.error(`Failed to remove team member: ${error.message || 'Unknown error'}`);
    },
  });
};

// Billing
export const useSubscription = () => {
  return useQuery({
    queryKey: settingsKeys.subscription,
    queryFn: settingsApi.getSubscription,
  });
};

export const useUsageMetrics = () => {
  return useQuery({
    queryKey: settingsKeys.usage,
    queryFn: settingsApi.getUsageMetrics,
  });
};

export const useInvoices = () => {
  return useQuery({
    queryKey: settingsKeys.invoices,
    queryFn: settingsApi.getInvoices,
  });
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: settingsKeys.paymentMethods,
    queryFn: settingsApi.getPaymentMethods,
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.subscription });
      toast.success('Subscription updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update subscription: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.subscription });
      toast.success('Subscription canceled');
    },
    onError: (error: any) => {
      toast.error(`Failed to cancel subscription: ${error.message || 'Unknown error'}`);
    },
  });
};

// Integrations
export const useApiKeys = () => {
  return useQuery({
    queryKey: settingsKeys.apiKeys,
    queryFn: settingsApi.getApiKeys,
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.apiKeys });
      toast.success('API key created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create API key: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.deleteApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.apiKeys });
      toast.success('API key deleted');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete API key: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useWebhooks = () => {
  return useQuery({
    queryKey: settingsKeys.webhooks,
    queryFn: settingsApi.getWebhooks,
  });
};

export const useCreateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.webhooks });
      toast.success('Webhook created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create webhook: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useUpdateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ webhookId, input }: { webhookId: string; input: UpdateWebhookInput }) =>
      settingsApi.updateWebhook(webhookId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.webhooks });
      toast.success('Webhook updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update webhook: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.webhooks });
      toast.success('Webhook deleted');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete webhook: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useTestWebhook = () => {
  return useMutation({
    mutationFn: settingsApi.testWebhook,
    onSuccess: () => {
      toast.success('Webhook test sent');
    },
    onError: (error: any) => {
      toast.error(`Webhook test failed: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useConnectedApps = () => {
  return useQuery({
    queryKey: settingsKeys.connectedApps,
    queryFn: settingsApi.getConnectedApps,
  });
};

// Security
export const useSecuritySessions = () => {
  return useQuery({
    queryKey: settingsKeys.securitySessions,
    queryFn: settingsApi.getSecuritySessions,
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.securitySessions });
      toast.success('Session revoked');
    },
    onError: (error: any) => {
      toast.error(`Failed to revoke session: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useRevokeAllSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.revokeAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.securitySessions });
      toast.success('All sessions revoked');
    },
    onError: (error: any) => {
      toast.error(`Failed to revoke sessions: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useAllowedIPs = () => {
  return useQuery({
    queryKey: settingsKeys.allowedIPs,
    queryFn: settingsApi.getAllowedIPs,
  });
};

export const useAddAllowedIP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.addAllowedIP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.allowedIPs });
      toast.success('IP address added');
    },
    onError: (error: any) => {
      toast.error(`Failed to add IP address: ${error.message || 'Unknown error'}`);
    },
  });
};

export const useRemoveAllowedIP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.removeAllowedIP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.allowedIPs });
      toast.success('IP address removed');
    },
    onError: (error: any) => {
      toast.error(`Failed to remove IP address: ${error.message || 'Unknown error'}`);
    },
  });
};

// Account (reuse from useAuth)
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: UpdateAccountInput) => usersApi.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      toast.success('Account updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update account: ${error.message || 'Unknown error'}`);
    },
  });
};
