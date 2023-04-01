import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { excludeData } from 'src/utils/excludeData';

@Injectable()
export class SocialTabService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllSocialTab(userId: string) {
    const listTab = await this.prismaService.userInTab.findMany({
      where: {
        userId: userId,
        delete: false,
        socialTab: {
          delete: false,
        },
      },
      include: {
        socialTab: {
          include: {
            SocialNetwork: true,
          },
        },
      },
    });

    return listTab.map((tab) => {
      const dataReturn = tab.socialTab;
      return excludeData(dataReturn, ['delete']);
    });
  }

  async getSocialTabById(tabId: string) {
    return await this.prismaService.socialTab.findFirst({
      where: { id: tabId },
    });
  }

  async updateWorkingStateById(tabId: string, state: boolean) {
    return await this.prismaService.socialTab.update({
      where: { id: tabId },
      data: { isWorked: state },
    });
  }

  async removeTabById(tabId: string) {
    return await this.prismaService.socialTab.update({
      where: { id: tabId },
      data: { delete: true },
    });
  }
}
