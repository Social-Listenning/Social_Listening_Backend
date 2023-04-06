import { SocialMessage, SocialPost } from '@prisma/client';

export const excludeSocialMessage: (keyof SocialMessage)[] = [
  'parentId',
  'sender',
];

export const excludeSocialPost: (keyof SocialPost)[] = ['tabId'];
