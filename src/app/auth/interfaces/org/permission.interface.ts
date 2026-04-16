export interface PermissionGroup {
  label: string;
  permissions: { key: string; description: string }[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: 'Bots',
    permissions: [
      { key: 'bot:create', description: 'Create bots' },
      { key: 'bot:edit', description: 'Edit bot configuration' },
      { key: 'bot:delete', description: 'Delete bots' },
      { key: 'bot:ingest', description: 'Ingest documents' },
      { key: 'bot:manage_keys', description: 'Create/revoke API keys' },
      { key: 'view:bots', description: 'View and list bots' },
      { key: 'use:bots', description: 'Query and chat with bots' },
    ],
  },
  {
    label: 'Members',
    permissions: [
      { key: 'member:invite', description: 'Invite new members' },
      { key: 'member:manage', description: 'Remove members, change roles, manage custom roles' },
    ],
  },
  {
    label: 'Organization',
    permissions: [
      { key: 'org:edit', description: 'Edit org settings, change status, transfer ownership' },
    ],
  },
  {
    label: 'Billing',
    permissions: [
      { key: 'billing:manage', description: 'Manage billing settings' },
      { key: 'billing:payment', description: 'Manage payment methods' },
    ],
  },
];
