export interface ConversationState {
  session_id: string;
  agent_id: string;
  status: 'active' | 'completed' | 'abandoned';
  collected_fields: Record<string, any>;
  required_fields: string[];
  completed_fields: string[];
  current_field?: string;
  started_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  field_key?: string;
  field_value?: any;
  metadata?: {
    model?: string;
    token_usage?: {
      prompt: number;
      completion: number;
      total: number;
    };
    clarification_needed?: boolean;
    validation_error?: string;
  };
}

export interface StreamingChunk {
  type: 'content' | 'field' | 'status' | 'error' | 'done';
  content?: string;
  field_key?: string;
  field_value?: any;
  status?: ConversationState;
  error?: string;
  done?: boolean;
}

export interface SendMessageInput {
  session_id: string;
  content: string;
  field_key?: string;
  field_value?: any;
}

export interface StartSessionInput {
  agent_slug: string;
  password?: string;
  captcha_token?: string;
}

export interface StartSessionResponse {
  session_id: string;
  agent: {
    id: string;
    name: string;
    avatar_url?: string;
    welcome_message: string;
    primary_color: string;
  };
  conversation_state: ConversationState;
  initial_message?: ChatMessage;
}

export interface ClarificationRequest {
  field_key: string;
  question: string;
  options?: string[];
  input_type?: 'text' | 'select' | 'date' | 'phone' | 'email' | 'number';
}
