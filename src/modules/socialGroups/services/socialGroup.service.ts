import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import {
  CreateSocialGroupDTO,
  EditSocialGroupDTO,
} from '../dtos/socialGroup.dto';
import { excludeData } from 'src/utils/excludeData';
import { SocialTabDTO } from '../dtos/socialTab.dto';

@Injectable()
export class SocialGroupService {
  constructor(private readonly prismaService: PrismaService) {}

  async createSocailGroup(data: CreateSocialGroupDTO) {
    const newSocialGroup = await this.prismaService.socialGroup.create({
      data: data,
    });
    return newSocialGroup;
  }

  async editSocialGroup(data: EditSocialGroupDTO) {
    const editedSocialGroup = await this.prismaService.socialGroup.update({
      where: { id: data.id },
      data: data,
    });
    return editedSocialGroup;
  }

  async getSocialGroupByManagerId(userId: string) {
    let newData = null;
    const socialGroup = await this.prismaService.socialGroup.findFirst({
      where: { managerId: userId },
    });
    if (socialGroup) newData = excludeData(socialGroup, ['managerId']);
    return newData;
  }

  async getSocialGroupById(socialGroupId: string) {
    const socialGroup = await this.prismaService.socialGroup.findFirst({
      where: { id: socialGroupId },
      include: {
        manager: true,
      },
    });
    return socialGroup;
  }

  async createNewTab(data: SocialTabDTO) {
    const newTab = await this.prismaService.socialTab.create({
      data: {
        group: {
          connect: { id: data.groupId },
        },
        SocialNetwork: {
          connect: { id: data.socialId },
        },
        name: data.name,
      },
    });
    return newTab;
  }
}
