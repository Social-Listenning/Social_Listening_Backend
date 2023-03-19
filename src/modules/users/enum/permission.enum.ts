export const UserPerm = {
  CreateAdminAccount: {
    displayName: 'Create Admin Account',
    permission: 'create-admin',
    screen: 'Users',
  },
  GetAllUser: {
    displayName: 'Get All Users',
    permission: 'table-user',
    screen: 'Users',
  },
  CreateUser: {
    displayName: 'Create User',
    permission: 'create-user',
    screen: 'Users',
  },
  UpdateUser: {
    displayName: 'Update User',
    permission: 'update-user',
    screen: 'Users',
  },
  ImportUser: {
    displayName: 'Import User',
    permission: 'import-user',
    screen: 'Users',
  },
  RemoveUser: {
    displayName: 'Remove User',
    permission: 'remove-user',
    screen: 'Users',
  },
  ActivateUser: {
    displayName: 'Activate User',
    permission: 'activate-user',
    screen: 'Users',
  },
  DeacticateUser: {
    displayName: 'Deactivate User',
    permission: 'deactivate-user',
    screen: 'Users',
  },
} as const;

export type UserPerm = keyof typeof UserPerm;
