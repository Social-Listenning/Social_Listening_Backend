export const SocialTabPerm = {
  updateWorkingStateTab: {
    displayName: 'Update Working State Tab',
    permission: 'update-working-state-tab',
    screen: 'Social Tab',
  },
  deleteSocialTab: {
    displayName: 'Delete Social Tab',
    permission: 'delete-social-tab',
    screen: 'Social Tab',
  },
} as const;

export type SocialTabPerm = keyof typeof SocialTabPerm;
