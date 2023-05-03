import { Injectable } from '@nestjs/common';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { PrismaService } from 'src/config/database/database.config.service';
import { SocialSenderService } from 'src/modules/socialSender/services/socialSender.service';
import { CreateMessageDTO } from '../dtos/message.dto';
import { SortOrderType } from 'src/common/enum/sortOrderType.enum';

@Injectable()
export class MessageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly socialSenderService: SocialSenderService,
  ) {}

  async createMessage(data: CreateMessageDTO) {
    try {
      const repliedMessageId = data.repliedMessageId;
      delete data.repliedMessageId;

      const message = await this.prismaService.message.create({
        data: data,
      });

      if (repliedMessageId) {
        await this.prismaService.messageReplied.create({
          data: {
            messageId: message.id,
            messageRepliedId: repliedMessageId,
          },
        });
      }

      return message;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async findMesssageByMessageId(messageId: string) {
    try {
      if (!messageId) return null;

      const message = await this.prismaService.message.findFirst({
        where: { messageId: messageId },
      });

      return message;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async getAllConversation(tabId: string, networkId: string) {
    const result = [];
    const listConversation = new Map<string, object>();

    try {
      const conversations = await this.prismaService.message.findMany({
        where: {
          AND: [
            { tabId: tabId },
            // { OR: [{ senderId: networkId }, { recipientId: networkId }] },
          ],
        },
        include: { sender: true, recipient: true },
        orderBy: { createdAt: SortOrderType.DESC },
      });

      conversations.forEach((conversation) => {
        const userSend =
          conversation.senderId !== networkId
            ? conversation.senderId
            : conversation.recipientId;
        if (!listConversation.has(userSend)) {
          const data = {
            sender:
              conversation.senderId !== networkId
                ? conversation.sender
                : conversation.recipient,
            message: conversation.message,
            lastSent: conversation.createdAt,
          };

          listConversation.set(userSend, data);
          result.push(data);
        }
      });

      return result;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async getMessageInConversation(page: any) {
    try {
      const listMessage = await this.prismaService.message.findMany({
        where: page.filter,
        orderBy: page.orders,
        skip: (page.pageNumber - 1) * page.size + page.offset,
        take: page.size,
        include: { sender: true },
      });

      return listMessage.map((message) => {
        return {
          message: message.message,
          sender: message.sender,
          createdAt: message.createdAt,
        };
      });
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async countMessage(page: any) {
    try {
      const listMessage = await this.prismaService.message.count({
        where: page.filter,
      });

      return listMessage;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
