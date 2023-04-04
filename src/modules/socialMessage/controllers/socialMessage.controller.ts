import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SocialMessageService } from '../services/socialMessage.service';
import { APIKeyGuard } from 'src/modules/auth/guards/apikey.guard';
import {
  SocialMessageDTO,
  SocialMessageInfoDTO,
  SocialPostDTO,
} from '../dtos/socialMessage.dto';
import { SocialTabService } from 'src/modules/socialGroups/services/socialTab.service';
import { WorkingState } from 'src/common/enum/workingState.enum';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { SocialPostService } from '../services/socialPost.service';

@Controller('social-message')
export class SocialMessageController {
  constructor(
    private socialMessageService: SocialMessageService,
    private socialPostService: SocialPostService,
    private socialTabService: SocialTabService,
  ) {}

  @Post('save')
  @UseGuards(APIKeyGuard)
  async saveMessage(@Body() message: SocialMessageInfoDTO) {
    const post = message.parent;
    const networkId = message.networkId;
    delete message['parent'];
    delete message['networkId'];

    const result = new ReturnResult<object>();

    try {
      let savedPost = null;
      const tab = await this.socialTabService.getTabByNetworkId(networkId);
      if (tab.isWorked === WorkingState.Pause)
        throw new Error(`SocialTab is stopping`);

      if (message.postId !== message.parentId) {
        savedPost = await this.socialPostService.findPost(post.postId);

        if (!savedPost) {
          savedPost = await this.socialPostService.savePost(
            this.remakePostData(post, tab.id),
          );
        }
      } else {
        console.log(post);
        const existedPost = await this.socialPostService.findPost(post.postId);
        if (existedPost) savedPost = existedPost;
        else {
          savedPost = savedPost = await this.socialPostService.savePost(
            this.remakePostData(post, tab.id),
          );
        }
      }

      const savedMessage = await this.socialMessageService.saveMessage(
        this.remakeMessageData(message, savedPost.id),
      );

      result.result = savedMessage;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  private remakePostData(post: SocialPostDTO, tabId: string): SocialPostDTO {
    const newPost = {
      ...post,
      createdAt: new Date(post.createdAt),
      tabId: tabId,
    };
    return newPost;
  }

  private remakeMessageData(
    message: SocialMessageInfoDTO,
    postId: string,
  ): SocialMessageDTO {
    const newMessage = {
      ...message,
      createdAt: new Date(message.createdAt),
      messageId: message.commentId,
      parentId: message.parentId === message.postId ? postId : message.parentId,
    };

    delete newMessage['postId'];
    delete newMessage['commentId'];

    return newMessage;
  }
}
