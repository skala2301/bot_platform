export interface MemberOut {
  uid: string;
  user_uid: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  roles: string[];
  joined_at: string;
}
