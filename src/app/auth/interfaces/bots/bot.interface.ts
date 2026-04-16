export interface Bot {
  uid: string;
  org_uid: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
  language_code: string | null;
  system_prompt: string | null;
  tone: string | null;
  fallback_message: string | null;
  model_name: string | null;
  model_location: 'local' | 'cloud' | null;
  created_at: string;
  updated_at: string;
}

export interface BotCreate {
  name: string;
  model_name: string;
  model_location: 'local' | 'cloud';
  language_code?: string | null;
  system_prompt?: string | null;
  tone?: string | null;
  fallback_message?: string | null;
}

export interface BotUpdate {
  name?: string;
  language_code?: string | null;
  system_prompt?: string | null;
  tone?: string | null;
  fallback_message?: string | null;
  model_name?: string | null;
  model_location?: 'local' | 'cloud' | null;
}

export interface BotDocument {
  uid: string;
  filename: string;
  source_type: 'file' | 'faq' | 'url';
  status: 'pending' | 'processing' | 'done' | 'failed';
  chunk_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface JobResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  detail: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
}

export interface ChatSource {
  content: string;
  source: string;
  score: number;
}

export interface ConversationMessage {
  uid: string;
  role: 'user' | 'assistant';
  content: string;
  tokens_used: number | null;
  created_at: string;
}

export interface Conversation {
  uid: string;
  bot_uid: string;
  session_id: string;
  created_at: string;
  updated_at: string;
  messages: ConversationMessage[];
}
