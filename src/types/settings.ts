// Settings & Preferences Types

export interface Workspace {
  id: string;
  name: string;
  default_agent_settings?: Record<string, unknown>;
  session_retention_days: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  avatar_url?: string;
  invited_at: string;
  joined_at?: string;
  sso_enabled?: boolean;
  scim_enabled?: boolean;
}

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    agents: number;
    sessions_per_month: number;
    tokens_per_month: number;
    storage_gb: number;
  };
}

export interface BillingSubscription {
  id: string;
  plan_id: string;
  plan: BillingPlan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface UsageMetrics {
  sessions_this_month: number;
  tokens_this_month: number;
  storage_used_gb: number;
  sessions_limit: number;
  tokens_limit: number;
  storage_limit_gb: number;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  created_at: string;
  period_start: string;
  period_end: string;
  pdf_url?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  auth_type: 'none' | 'bearer' | 'basic';
  triggers: ('on-complete' | 'per-message')[];
  is_active: boolean;
  created_at: string;
  last_triggered_at?: string;
}

export interface ConnectedApp {
  id: string;
  name: string;
  provider: string;
  icon_url?: string;
  connected_at: string;
  scopes: string[];
}

export interface SecuritySession {
  id: string;
  device_name?: string;
  ip_address: string;
  user_agent: string;
  location?: string;
  last_active: string;
  is_current: boolean;
}

export interface AllowedIP {
  id: string;
  ip_address: string;
  description?: string;
  created_at: string;
}

export interface UpdateAccountInput {
  full_name?: string;
  email?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  default_agent_settings?: Record<string, unknown>;
  session_retention_days?: number;
}

export interface InviteTeamMemberInput {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface CreateApiKeyInput {
  name: string;
  expires_in_days?: number;
}

export interface CreateWebhookInput {
  name: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  auth_type: 'none' | 'bearer' | 'basic';
  auth_token?: string;
  triggers: ('on-complete' | 'per-message')[];
}

export interface UpdateWebhookInput {
  name?: string;
  url?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  auth_type?: 'none' | 'bearer' | 'basic';
  auth_token?: string;
  triggers?: ('on-complete' | 'per-message')[];
  is_active?: boolean;
}

export interface AddAllowedIPInput {
  ip_address: string;
  description?: string;
}
