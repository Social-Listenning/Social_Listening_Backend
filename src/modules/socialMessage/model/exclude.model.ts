import { SocialMessage } from '@prisma/client';

export const excludeSocialMessage: (keyof SocialMessage)[] = [
  'parentId',
  'sender',
];
