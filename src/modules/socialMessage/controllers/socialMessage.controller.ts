import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
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
import { JWTAuthGuard } from 'src/modules/auth/guards/jwtAuth.guard';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { SocialMessagePage } from '../dtos/SocialMessagePage.dto';
import { UserInTabService } from 'src/modules/users/services/userInTab.service';
import { AdvancedFilteringService } from 'src/config/database/advancedFiltering.service';
import { PagedData } from 'src/common/models/paging/pagedData.dto';
import { SocialPostWithMessage } from '../dtos/socialPostWithMessage.dto';

@Controller('social-message')
export class SocialMessageController {
  constructor(
    private advancedFilteringService: AdvancedFilteringService,
    private socialMessageService: SocialMessageService,
    private socialPostService: SocialPostService,
    private socialTabService: SocialTabService,
    private userInTabService: UserInTabService,
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

  @Post('/:tabId')
  @UseGuards(JWTAuthGuard)
  async getAllMessage(
    @Req() request: RequestWithUser,
    @Body() page: SocialMessagePage,
    @Param('tabId') tabId: string,
  ) {
    const user = request.user;
    const pagedData = new PagedData<object>(page);
    const result = new ReturnResult<PagedData<object>>();

    try {
      const exist = await this.userInTabService.checkUserInTab(user.id, tabId);
      if (!exist) throw new Error(`You are not allowed to access this page`);

      const data = this.advancedFilteringService.createFilter(page);
      data.filter.AND.push({ type: { not: { equals: 'Bot' } } });
      const listResult = await this.socialMessageService.getCommentPage(data);
      pagedData.page.totalElement =
        await this.socialMessageService.countComment(data);
      pagedData.data = listResult;
      result.result = pagedData;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Get('/:socialMessageId')
  @UseGuards(JWTAuthGuard)
  async getAllMessageWithId(
    @Req() request: RequestWithUser,
    @Param('socialMessageId') messageId: string,
  ) {
    const result = new ReturnResult<SocialPostWithMessage>();
    const postWithMessage = new SocialPostWithMessage();
    try {
      const rootMessage = await this.socialMessageService.getRootMessage(
        messageId,
      );
      const socialPost = await this.socialPostService.getSocialPostById(
        rootMessage.parentId,
      );
      postWithMessage.post = socialPost;
      postWithMessage.message =
        await this.socialMessageService.getAllConversation(
          rootMessage.messageId,
        );
      result.result = postWithMessage;
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
