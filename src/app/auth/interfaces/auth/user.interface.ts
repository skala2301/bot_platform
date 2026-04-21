export interface UserOut {
  uid: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_verified: boolean;
  status: 'pending_verification' | 'active' | 'inactive';
  created_at: string;
}

export type UserStatus = UserOut['status'];

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

/** UI draft shape for the register form — adds a confirmPassword field
 *  that's validated client-side but not sent to the server. */
export interface RegisterForm extends RegisterRequest {
  confirmPassword: string;
}

/** UI draft shape for the reset-password form. */
export interface ResetPasswordForm {
  token: string;
  password: string;
  confirm: string;
}
