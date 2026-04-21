export interface OrgOut {
  uid: string;
  name: string;
  label: string | null;
  slug: string;
  status: 'active' | 'suspended' | 'closed';
  plan: 'free' | 'starter' | 'pro';
  created_at: string;
  updated_at: string;
}

export type OrgStatus = OrgOut['status'];
export type OrgPlan = OrgOut['plan'];

export interface OrgCreate {
  name: string;
  label?: string;
}

export interface OrgUpdate {
  name?: string;
  label?: string;
}

/** UI draft shape used by the Organization Details form. */
export interface OrgDetailsForm {
  name: string;
  label: string;
}
