import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { SocialMessageDTO } from '../dtos/socialMessage.dto';
import { excludeData } from 'src/utils/excludeData';

@Injectable()
export class SocialMessageService {
  constructor(private prismaService: PrismaService) {}

  async saveMessage(message: SocialMessageDTO) {
    const savedMessage = await this.prismaService.socialMessage.create({
      data: message,
    });
    return savedMessage;
  }

  async findCommentById(messageId: string) {
    return await this.prismaService.socialMessage.findFirst({
      where: { id: messageId },
    });
  }

  async getRootMessage(messageId: string) {
    const message = await this.findCommentById(messageId);
    if (!message) return message;

    const root = await this.getRootMessageById(message.parentId);
    if (!root) return message;
    else return root;
  }

  private async getRootMessageById(messageId) {
    return await this.prismaService.socialMessage.findFirst({
      where: { messageId: messageId },
    });
  }

  async getCommentPage(page) {
    const listComments = await this.prismaService.socialMessage.findMany({
      where: page.filter,
      orderBy: page.orders,
      skip: (page.pageNumber - 1) * page.size,
      take: page.size,
    });
    return listComments.map((data) =>
      excludeData(data, ['parentId', 'sender']),
    );
  }

  async getAllConversation(messageId: string) {
    const listComments = await this.prismaService.socialMessage.findMany({
      where: { OR: [{ messageId: messageId }, { parentId: messageId }] },
      orderBy: { createdAt: 'asc' },
    });
    return listComments.map((data) =>
      excludeData(data, ['parentId', 'sender']),
    );
  }
  async countComment(page) {
    const countComments = await this.prismaService.socialMessage.count({
      where: page.filter,
    });
    return countComments;
  }
}
