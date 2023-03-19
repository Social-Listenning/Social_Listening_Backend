import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';

@Injectable()
export class UserInGroupService {
  constructor(private readonly prismaService: PrismaService) {}

  async addUserToGroup(userId: string, groupId: string) {
    return await this.prismaService.userInGroup.create({
      data: {
        user: { connect: { id: userId } },
        group: { connect: { id: groupId } },
      },
    });
  }

  async removeUserFromGroup(userId: string, groupId: string) {
    const data = await this.getUserWithGroup(userId, groupId);
    await this.prismaService.userInGroup.update({
      where: { id: data.id },
      data: { delete: true },
    });
  }

  async getGroupById(userId: string) {
    const data = await this.prismaService.userInGroup.findFirst({
      where: { userId: userId },
      include: { group: true },
    });

    return data !== null ? data.group : null;
  }

  async getUserWithGroup(userId: string, groupId: string) {
    return await this.prismaService.userInGroup.findFirst({
      where: { userId: userId, groupId: groupId, delete: false },
    });
  }

  async activateAccount(userId: string, groupId: string) {
    const data = await this.getUserWithGroup(userId, groupId);
    return await this.prismaService.userInGroup.update({
      where: { id: data.id },
      data: { isActive: true },
    });
  }

  async deactivateAccount(userId: string, groupId: string) {
    const data = await this.getUserWithGroup(userId, groupId);
    return await this.prismaService.userInGroup.update({
      where: { id: data.id },
      data: { isActive: false },
    });
  }
}
