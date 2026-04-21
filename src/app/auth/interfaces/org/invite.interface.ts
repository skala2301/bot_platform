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

/**
 * Human-friendly descriptor for a role that can be assigned via an invite.
 * Rendered in the invite form's role checklist. The `name` field matches the
 * server-side role identifier.
 */
export interface AssignableRole {
  name: string;
  label: string;
  description: string;
}
