export class CreateSocialMessageDTO {
  networkId: string;
  message: string;
  sender: string;
  createdAt: Date;
  type: string;
  parent: SocialPostDTO;
}

export class SocialMessageDTO {
  type: string;
  sender: string;
  message: string;
  createdAt: Date;
  parentId: string;
  messageId: string;
}

export class SocialPostDTO {
  postId: string;
  message: string;
  permalinkUrl: string;
  createdAt: Date;
  tabId: string;
}

export class SocialMessageInfoDTO extends CreateSocialMessageDTO {
  postId: string;
  commentId: string;
  parentId: string;
}
