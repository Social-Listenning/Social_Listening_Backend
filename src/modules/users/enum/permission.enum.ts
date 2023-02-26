export const UserPerm = {
  GetAllUser: {
    displayName: 'Get All Users',
    permission: 'table-user',
    screen: 'Users',
  },
} as const;

export type UserPerm = keyof typeof UserPerm;
