export enum BusinessRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
}

export const RolePermissions = {
  [BusinessRole.OWNER]: [
    'business:create',
    'business:edit',
    'business:delete',
    'ai:configure',
    'calls:view',
    'calls:delete',
    'users:invite',
    'users:remove',
    'users:changeRole',
    'billing:access',
    'integrations:manage',
    'dashboard:view',
  ],

  [BusinessRole.ADMIN]: [
    'business:edit',
    'ai:configure',
    'calls:view',
    'calls:delete',
    'users:invite',
    'users:remove',
    'users:changeRole',
    'billing:access',
    'integrations:manage',
    'dashboard:view',
  ],

  [BusinessRole.MANAGER]: [
    'ai:configure',
    'calls:view',
    'integrations:manage',
    'dashboard:view',
  ],

  [BusinessRole.STAFF]: [
    'calls:view',
    'dashboard:view',
  ],
} as const;

type Permission = typeof RolePermissions[BusinessRole][number];

export function can(role: BusinessRole, action: string): boolean {
  const permissions = RolePermissions[role] as readonly string[];
  return permissions?.includes(action) ?? false;
}

export function getUserPermissions(role: string): readonly string[] {
  return RolePermissions[role as BusinessRole] || [];
}
