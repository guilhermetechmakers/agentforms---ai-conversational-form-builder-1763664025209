import { api } from '@/lib/api';
import type {
  Workspace,
  TeamMember,
  BillingSubscription,
  UsageMetrics,
  Invoice,
  PaymentMethod,
  ApiKey,
  Webhook,
  ConnectedApp,
  SecuritySession,
  AllowedIP,
  UpdateWorkspaceInput,
  InviteTeamMemberInput,
  CreateApiKeyInput,
  CreateWebhookInput,
  UpdateWebhookInput,
  AddAllowedIPInput,
} from '@/types/settings';

export const settingsApi = {
  // Workspace
  getWorkspace: async (): Promise<Workspace> => {
    return api.get<Workspace>('/settings/workspace');
  },

  updateWorkspace: async (updates: UpdateWorkspaceInput): Promise<Workspace> => {
    return api.put<Workspace>('/settings/workspace', updates);
  },

  // Team & Roles
  getTeamMembers: async (): Promise<TeamMember[]> => {
    return api.get<TeamMember[]>('/settings/team');
  },

  inviteTeamMember: async (input: InviteTeamMemberInput): Promise<TeamMember> => {
    return api.post<TeamMember>('/settings/team/invite', input);
  },

  updateTeamMemberRole: async (memberId: string, role: TeamMember['role']): Promise<TeamMember> => {
    return api.patch<TeamMember>(`/settings/team/${memberId}/role`, { role });
  },

  removeTeamMember: async (memberId: string): Promise<void> => {
    return api.delete<void>(`/settings/team/${memberId}`);
  },

  // Billing
  getSubscription: async (): Promise<BillingSubscription> => {
    return api.get<BillingSubscription>('/settings/billing/subscription');
  },

  getUsageMetrics: async (): Promise<UsageMetrics> => {
    return api.get<UsageMetrics>('/settings/billing/usage');
  },

  getInvoices: async (): Promise<Invoice[]> => {
    return api.get<Invoice[]>('/settings/billing/invoices');
  },

  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    return api.get<PaymentMethod[]>('/settings/billing/payment-methods');
  },

  addPaymentMethod: async (paymentMethodId: string): Promise<PaymentMethod> => {
    return api.post<PaymentMethod>('/settings/billing/payment-methods', { payment_method_id: paymentMethodId });
  },

  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<void> => {
    return api.post<void>(`/settings/billing/payment-methods/${paymentMethodId}/set-default`, {});
  },

  removePaymentMethod: async (paymentMethodId: string): Promise<void> => {
    return api.delete<void>(`/settings/billing/payment-methods/${paymentMethodId}`);
  },

  updateSubscription: async (planId: string): Promise<BillingSubscription> => {
    return api.post<BillingSubscription>('/settings/billing/subscription/update', { plan_id: planId });
  },

  cancelSubscription: async (): Promise<BillingSubscription> => {
    return api.post<BillingSubscription>('/settings/billing/subscription/cancel', {});
  },

  // Integrations
  getApiKeys: async (): Promise<ApiKey[]> => {
    return api.get<ApiKey[]>('/settings/integrations/api-keys');
  },

  createApiKey: async (input: CreateApiKeyInput): Promise<{ api_key: ApiKey; key: string }> => {
    return api.post<{ api_key: ApiKey; key: string }>('/settings/integrations/api-keys', input);
  },

  deleteApiKey: async (keyId: string): Promise<void> => {
    return api.delete<void>(`/settings/integrations/api-keys/${keyId}`);
  },

  getWebhooks: async (): Promise<Webhook[]> => {
    return api.get<Webhook[]>('/settings/integrations/webhooks');
  },

  createWebhook: async (input: CreateWebhookInput): Promise<Webhook> => {
    return api.post<Webhook>('/settings/integrations/webhooks', input);
  },

  updateWebhook: async (webhookId: string, input: UpdateWebhookInput): Promise<Webhook> => {
    return api.put<Webhook>(`/settings/integrations/webhooks/${webhookId}`, input);
  },

  deleteWebhook: async (webhookId: string): Promise<void> => {
    return api.delete<void>(`/settings/integrations/webhooks/${webhookId}`);
  },

  testWebhook: async (webhookId: string): Promise<{ success: boolean; response?: unknown }> => {
    return api.post<{ success: boolean; response?: unknown }>(`/settings/integrations/webhooks/${webhookId}/test`, {});
  },

  getConnectedApps: async (): Promise<ConnectedApp[]> => {
    return api.get<ConnectedApp[]>('/settings/integrations/connected-apps');
  },

  disconnectApp: async (appId: string): Promise<void> => {
    return api.delete<void>(`/settings/integrations/connected-apps/${appId}`);
  },

  // Security
  getSecuritySessions: async (): Promise<SecuritySession[]> => {
    return api.get<SecuritySession[]>('/settings/security/sessions');
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    return api.delete<void>(`/settings/security/sessions/${sessionId}`);
  },

  revokeAllSessions: async (): Promise<void> => {
    return api.post<void>('/settings/security/sessions/revoke-all', {});
  },

  getAllowedIPs: async (): Promise<AllowedIP[]> => {
    return api.get<AllowedIP[]>('/settings/security/allowed-ips');
  },

  addAllowedIP: async (input: AddAllowedIPInput): Promise<AllowedIP> => {
    return api.post<AllowedIP>('/settings/security/allowed-ips', input);
  },

  removeAllowedIP: async (ipId: string): Promise<void> => {
    return api.delete<void>(`/settings/security/allowed-ips/${ipId}`);
  },
};
