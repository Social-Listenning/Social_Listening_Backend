import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { APIKeyGuard } from 'src/modules/auth/guards/apikey.guard';
import { MessageDTO, MessageInConversationDTO } from '../dtos/message.dto';
import { SocialSenderService } from 'src/modules/socialSender/services/socialSender.service';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { SocialTabService } from 'src/modules/socialGroups/services/socialTab.service';
import { WorkingState } from 'src/common/enum/workingState.enum';
import { JWTAuthGuard } from 'src/modules/auth/guards/jwtAuth.guard';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { UserInTabService } from 'src/modules/users/services/userInTab.service';
import { PagedData } from 'src/common/models/paging/pagedData.dto';
import { MessagePage } from '../dtos/messagePage.dto';
import { AdvancedFilteringService } from 'src/config/database/advancedFiltering.service';
import { SortOrderType } from 'src/common/enum/sortOrderType.enum';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly socialTabService: SocialTabService,
    private readonly socialSenderService: SocialSenderService,
    private readonly userInTabService: UserInTabService,
    private readonly advancedFilteringService: AdvancedFilteringService,
  ) {}

  @Post('save')
  @UseGuards(APIKeyGuard)
  async createMessage(@Body() message: MessageDTO) {
    const result = new ReturnResult<object>();

    try {
      const tab = await this.socialTabService.getTabByNetworkId(
        message.networkId,
      );
      if (tab.isWorked === WorkingState.Pause)
        throw new Error(`SocialTab is stopping`);

      let sender = await this.socialSenderService.findSender(message.sender.id);
      if (!sender) {
        sender = await this.socialSenderService.createSender({
          type: 'Facebook',
          senderId: message.sender.id,
          fullName: message.sender.name,
          avatarUrl: message.sender.avatar,
        });
      }

      let recipient = await this.socialSenderService.findSender(
        message.recipient.id,
      );
      if (!recipient) {
        recipient = await this.socialSenderService.createSender({
          type: 'Facebook',
          senderId: message.recipient.id,
          fullName: message.recipient.name,
          avatarUrl: message.recipient.avatar,
        });
      }

      const repliedMessage = await this.messageService.findMesssageByMessageId(
        message.repliedMessageId,
      );
      if (!repliedMessage) message.repliedMessageId = null;

      const newMessage = await this.messageService.createMessage({
        message: message.message,
        senderId: sender.id,
        recipientId: recipient.id,
        tabId: tab.id,
        messageId: message.messageId,
        repliedMessageId: message.repliedMessageId,
        createdAt: message.createdAt,
      });
      result.result = newMessage;
    } catch (error) {
      result.message = error.message;
    }

    return result;
  }

  @Get('/:tabId/conversations')
  @UseGuards(JWTAuthGuard)
  async getAllConversation(
    @Req() request: RequestWithUser,
    @Param() { tabId },
  ) {
    const user = request.user;
    const result = new ReturnResult<object[]>();

    try {
      const exist = await this.userInTabService.checkUserInTab(user.id, tabId);
      if (!exist) throw new Error(`You are not allowed to access this page`);

      const tabInfo = await this.socialTabService.getSocialTabInfo(tabId);
      const networkInfo = JSON.parse(tabInfo.SocialNetwork.extendData);
      const sender = await this.socialSenderService.findSender(networkInfo.id);

      const listConversation = await this.messageService.getAllConversation(
        tabId,
        sender.id,
      );
      result.result = listConversation;
    } catch (error) {
      result.message = error.message;
    }

    return result;
  }

  @Post('/:tabId/:userId')
  @UseGuards(JWTAuthGuard)
  async getMessageInConversation(
    @Req() request: RequestWithUser,
    @Param() { tabId, userId },
    @Body() page: MessagePage,
  ) {
    const user = request.user;
    const pagedData = new PagedData<MessageInConversationDTO>(page);
    const result = new ReturnResult<PagedData<MessageInConversationDTO>>();
    try {
      const exist = await this.userInTabService.checkUserInTab(user.id, tabId);
      if (!exist) throw new Error(`You are not allowed to access this page`);

      const tabInfo = await this.socialTabService.getSocialTabInfo(tabId);
      const networkInfo = JSON.parse(tabInfo.SocialNetwork.extendData);
      const sender = await this.socialSenderService.findSender(networkInfo.id);

      page.filter = [];
      page.orders = [];
      if (!page.offset) page.offset = 0;

      const data = this.advancedFilteringService.createFilter(page);
      data.orders.push({ createdAt: SortOrderType.DESC });
      data.filter.AND.push({ tabId: tabId });
      data.filter.AND.push({
        OR: [
          { senderId: sender.id, recipientId: userId },
          { senderId: userId, recipientId: sender.id },
        ],
      });

      pagedData.data = await this.messageService.getMessageInConversation(data);
      pagedData.page.totalElement = await this.messageService.countMessage(
        data,
      );

      result.result = pagedData;
    } catch (error) {
      result.message = error.message;
    }

    return result;
  }
}