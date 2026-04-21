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

/** UI draft shape for the "Create custom role" form. */
export interface RoleCreateForm {
  name: string;
  label: string;
  description: string;
}

/** Role names the backend treats as built-in and therefore non-editable. */
export const BUILT_IN_ROLE_NAMES: ReadonlyArray<string> = [
  'owner',
  'admin',
  'member',
  'system_admin',
];
