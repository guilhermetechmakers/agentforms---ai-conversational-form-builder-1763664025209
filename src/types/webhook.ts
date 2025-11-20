export interface WebhookConfig {
  id: string;
  agent_id: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  auth_type: 'none' | 'bearer' | 'basic';
  auth_token?: string;
  auth_username?: string;
  auth_password?: string;
  triggers: ('on-complete' | 'per-message')[];
  hmac_secret?: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWebhookInput {
  agent_id: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  auth_type: 'none' | 'bearer' | 'basic';
  auth_token?: string;
  auth_username?: string;
  auth_password?: string;
  triggers: ('on-complete' | 'per-message')[];
  hmac_secret?: string;
  enabled?: boolean;
}

export interface UpdateWebhookInput {
  url?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  auth_type?: 'none' | 'bearer' | 'basic';
  auth_token?: string;
  auth_username?: string;
  auth_password?: string;
  triggers?: ('on-complete' | 'per-message')[];
  hmac_secret?: string;
  enabled?: boolean;
}

export interface DeliveryLog {
  id: string;
  webhook_id: string;
  session_id?: string;
  timestamp: string;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  status_code?: number;
  request_payload: Record<string, any>;
  response_body?: string;
  error_message?: string;
  attempted_at: string;
  completed_at?: string;
  retry_count: number;
  next_retry_at?: string;
}

export interface DeadLetterQueueEntry {
  id: string;
  webhook_id: string;
  session_id?: string;
  payload: Record<string, any>;
  error_details: string;
  attempted_at: string;
  retry_count: number;
  created_at: string;
}

export interface WebhookTestResult {
  success: boolean;
  status_code?: number;
  response_body?: string;
  error_message?: string;
  response_time_ms?: number;
  timestamp: string;
}

export interface WebhookFilter {
  agent_id?: string;
  enabled?: boolean;
  status?: 'pending' | 'success' | 'failed' | 'retrying';
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}
