export interface RoleOut {
  uid: string;
  name: string;
  label: string;
  description: string | null;
  permissions: string[];
}

export interface RoleCreate {
  name: string;
  label: string;
  description?: string;
  permissions: string[];
}

export interface RoleUpdate {
  label?: string;
  description?: string;
  permissions?: string[];
}
