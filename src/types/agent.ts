export interface Agent {
  id: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  slug: string;
  public_url: string;
  schema: SchemaField[];
  persona: PersonaConfig;
  knowledge: KnowledgeConfig;
  appearance: AppearanceConfig;
  advanced: AdvancedConfig;
  session_count: number;
  last_activity: string;
  primary_color: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface SchemaField {
  id: string;
  label: string;
  key: string;
  type: 'text' | 'number' | 'email' | 'select' | 'date' | 'phone' | 'textarea' | 'file';
  required: boolean;
  validation?: ValidationRule;
  placeholder?: string;
  options?: string[]; // For select type
  order: number;
}

export interface ValidationRule {
  min?: number;
  max?: number;
  pattern?: string;
  custom?: string;
}

export interface PersonaConfig {
  system_prompt: string;
  tone: 'professional' | 'friendly' | 'casual' | 'formal';
  sample_messages?: string[];
  conversation_constraints?: string;
  fallback_policy?: string;
}

export interface KnowledgeConfig {
  documents: KnowledgeDocument[];
  chunking_enabled: boolean;
  embedding_enabled: boolean;
  indexing_status: 'idle' | 'indexing' | 'completed' | 'error';
  indexing_error?: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'text' | 'pdf' | 'markdown';
  content?: string;
  file_url?: string;
  indexed_at?: string;
}

export interface AppearanceConfig {
  primary_color: string;
  avatar_url?: string;
  logo_url?: string;
  welcome_message: string;
}

export interface AdvancedConfig {
  publish_settings: PublishSettings;
  webhook_config?: WebhookConfig;
  session_retention_days?: number;
}

export interface PublishSettings {
  slug: string;
  custom_domain?: string;
  password_protected: boolean;
  password_hash?: string;
  captcha_enabled: boolean;
}

export interface WebhookConfig {
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  auth_type?: 'none' | 'bearer' | 'basic';
  auth_token?: string;
  triggers: ('on-complete' | 'per-message')[];
  hmac_secret?: string;
}

export interface CreateAgentInput {
  name: string;
  schema?: SchemaField[];
  persona?: Partial<PersonaConfig>;
  knowledge?: Partial<KnowledgeConfig>;
  appearance?: Partial<AppearanceConfig>;
  advanced?: Partial<AdvancedConfig>;
}

export interface UpdateAgentInput {
  name?: string;
  status?: 'draft' | 'published' | 'archived';
  schema?: SchemaField[];
  persona?: Partial<PersonaConfig>;
  knowledge?: Partial<KnowledgeConfig>;
  appearance?: Partial<AppearanceConfig>;
  advanced?: Partial<AdvancedConfig>;
}
