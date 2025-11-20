export interface Session {
  id: string;
  agent_id: string;
  agent_name: string;
  status: 'active' | 'completed' | 'abandoned' | 'paused' | 'terminated';
  state?: 'running' | 'paused' | 'stopped';
  started_at: string;
  completed_at?: string;
  paused_at?: string;
  resumed_at?: string;
  terminated_at?: string;
  duration_seconds?: number;
  collected_fields: Record<string, any>;
  collected_fields_count: number;
  score?: number;
  respondent_id?: string;
  respondent_email?: string;
  messages: Message[];
  webhook_logs: WebhookLog[];
  retention_policy?: RetentionPolicy;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  token_usage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  metadata?: Record<string, any>;
}

export interface WebhookLog {
  id: string;
  session_id: string;
  webhook_url: string;
  method: string;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  status_code?: number;
  request_payload: Record<string, any>;
  response_body?: string;
  error_message?: string;
  attempted_at: string;
  completed_at?: string;
  retry_count: number;
}

export interface SessionFilter {
  agent_id?: string;
  status?: 'active' | 'completed' | 'abandoned' | 'paused' | 'terminated';
  state?: 'running' | 'paused' | 'stopped';
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RetentionPolicy {
  id: string;
  session_id?: string;
  agent_id?: string;
  retention_period_days: number;
  action_type: 'archive' | 'delete';
  auto_enforce: boolean;
  created_at: string;
  updated_at: string;
}

export interface FieldValue {
  session_id: string;
  field_name: string;
  value: any;
  validation_status: 'valid' | 'invalid' | 'pending';
  extracted_at: string;
  updated_at: string;
}

export interface SessionCreateRequest {
  agent_id: string;
  respondent_id?: string;
  respondent_email?: string;
  initial_data?: Record<string, any>;
  retention_policy?: Partial<RetentionPolicy>;
}

export interface SessionStateUpdate {
  state: 'running' | 'paused' | 'stopped';
  reason?: string;
}
