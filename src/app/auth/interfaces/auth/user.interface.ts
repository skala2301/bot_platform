export interface UserOut {
  uid: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_verified: boolean;
  status: 'pending_verification' | 'active' | 'inactive';
  created_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}
