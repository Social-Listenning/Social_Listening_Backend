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
  RemoveUser: {
    displayName: 'Remove User',
    permission: 'remove-user',
    screen: 'Users',
  },
} as const;

export type UserPerm = keyof typeof UserPerm;
