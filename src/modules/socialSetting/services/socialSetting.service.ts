import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { SocialSettingDTO } from '../dtos/socialSetting.dto';

@Injectable()
export class SocialSettingService {
  constructor(private readonly prismaService: PrismaService) {}

  async createSocialSetting(socialSetting: SocialSettingDTO) {
    const setting = await this.prismaService.socialTabSettingg.create({
      data: socialSetting,
    });
    return setting;
  }

  async findSocialSetting(tabId: string, groupId: string, keyId: string) {
    const setting = await this.prismaService.socialTabSettingg.findFirst({
      where: {
        tabId: tabId,
        group: groupId,
        key: keyId,
      },
    });
    return setting;
  }

  async getSocialSetting(tabId: string) {
    const setting = await this.prismaService.socialTabSettingg.findMany({
      where: { tabId: tabId },
    });
    return setting;
  }

  async updateSocicalSetting(settingId: number, setting: SocialSettingDTO) {
    const updatedSetting = await this.prismaService.socialTabSettingg.update({
      data: setting,
      where: { id: settingId },
    });
    return updatedSetting;
  }
}
