import { User } from '@prisma/client';

export const excludeUser: (keyof User)[] = [
  'password',
  'createdAt',
  'updatedAt',
  'roleId',
  'deleteAt',
  'refreshToken',
];
