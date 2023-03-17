export const PermissionPerm = {
  AssignPermission: {
    displayName: 'Assign Permission to Role',
    permission: 'assign-permission',
    screen: 'Permissions',
  },
  RemovePermission: {
    displayName: 'Remove Permission of Role',
    permission: 'remove-permission',
    screen: 'Permissions',
  },
  GetAllPermissions: {
    displayName: 'Get All Permissions',
    permission: 'table-permission',
    screen: 'Permissions',
  },
} as const;

export type PermissionPerm = keyof typeof PermissionPerm;
