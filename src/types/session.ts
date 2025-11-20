export interface Session {
  id: string;
  agent_id: string;
  agent_name: string;
  status: 'active' | 'completed' | 'abandoned';
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  collected_fields: Record<string, any>;
  collected_fields_count: number;
  score?: number;
  respondent_id?: string;
  respondent_email?: string;
  messages: Message[];
  webhook_logs: WebhookLog[];
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
  status?: 'active' | 'completed' | 'abandoned';
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}
