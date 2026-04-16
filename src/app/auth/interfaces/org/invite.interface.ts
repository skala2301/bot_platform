export interface InviteOut {
  uid: string;
  email: string;
  roles: string[];
  accepted: boolean;
  expires_at: string;
  created_at: string;
}

export interface InviteCreate {
  email: string;
  roles?: string[];
}
