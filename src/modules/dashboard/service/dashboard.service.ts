import { Injectable } from '@nestjs/common';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { PrismaService } from 'src/config/database/database.config.service';
import { SocialTabService } from 'src/modules/socialGroups/services/socialTab.service';
import { SocialSenderService } from 'src/modules/socialSender/services/socialSender.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly socialTabService: SocialTabService,
    private readonly socialSenderService: SocialSenderService,
  ) {}

  async getLineChart(tabId: string, dateStart: Date, dateEnd: Date) {
    try {
      const tabWithInfo = await this.socialTabService.getSocialTabInfo(tabId);
      const networkInfo = JSON.parse(tabWithInfo.SocialNetwork.extendData);

      const sender = await this.socialSenderService.findSender(networkInfo.id);
      const startDate = new Date(
        dateStart.getFullYear(),
        dateStart.getMonth(),
        dateStart.getDate(),
      );
      let endDate = new Date(
        dateEnd.getFullYear(),
        dateEnd.getMonth(),
        dateEnd.getDate(),
      );
      // Get Data with hour
      if (startDate === endDate) {
      }
      // Get Data with date
      else {
        endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
        const listComment = await this.countCommentPerDay(startDate, endDate);
        const listMessage = await this.countMessagePerDay(
          sender.id,
          startDate,
          endDate,
        );
        const result = this.mergeData(listComment, listMessage);
        return result;
      }
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  private async countCommentPerDay(startDate: Date, endDate: Date) {
    const comments = await this.prismaService.socialMessage.findMany({
      where: {
        AND: [
          { type: { not: { equals: 'Bot' } } },
          { type: { not: { startsWith: 'Agent' } } },
        ],
        createdAt: { gte: startDate, lt: endDate },
      },
      select: {
        createdAt: true,
      },
    });

    const commentsByDay = comments.reduce((arr, comment) => {
      const date = comment.createdAt.toISOString().split('T')[0];

      if (!arr[date]) arr[date] = 0;
      arr[date]++;

      return arr;
    }, {});

    return Object.entries(commentsByDay).map(([date, count]) => ({
      date,
      count,
    }));
  }

  private async countMessagePerDay(
    senderId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const messages = await this.prismaService.message.findMany({
      where: {
        senderId: { not: { equals: senderId } },
        createdAt: { gte: startDate, lt: endDate },
      },
      select: {
        createdAt: true,
      },
    });

    const messagesByDay = messages.reduce((arr, message) => {
      const date = message.createdAt.toISOString().split('T')[0];

      if (!arr[date]) arr[date] = 0;
      arr[date]++;

      return arr;
    }, {});

    return Object.entries(messagesByDay).map(([date, count]) => ({
      date,
      count,
    }));
  }

  private mergeData(listComment: any[], listMessage: any[]) {
    const comments = listComment.map((value) => {
      return { ...value, type: 'Comment' };
    });
    const messages = listMessage.map((value) => {
      return { ...value, type: 'Message' };
    });
    const mergeArray = [...comments, ...messages];

    const resultReturn = mergeArray.reduce((arr, item) => {
      if (!arr[item.date]) {
        arr[item.date] = {
          date: item.date,
          commentCount: 0,
          messageCount: 0,
        };
      }

      if (item.type === 'Comment') {
        arr[item.date].commentCount += item.count;
      } else if (item.type === 'Message') {
        arr[item.date].messageCount += item.count;
      }

      return arr;
    }, {});

    return resultReturn;
  }
}
