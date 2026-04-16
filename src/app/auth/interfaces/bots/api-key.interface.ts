export interface ApiKeyCreate {
  label?: string;
}

export interface ApiKeyCreated {
  uid: string;
  bot_uid: string;
  status: 'active';
  label: string | null;
  created_at: string;
  raw_key: string;
}

export interface ApiKeyOut {
  uid: string;
  bot_uid: string;
  status: 'active' | 'revoked';
  label: string | null;
  created_at: string;
}
