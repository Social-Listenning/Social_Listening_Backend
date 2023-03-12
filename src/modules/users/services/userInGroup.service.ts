import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';

@Injectable()
export class UserInGroupService {
  constructor(private readonly prismaService: PrismaService) {}

  async addUserToGroup(userId: string, groupId: string) {
    return this.prismaService.userInGroup.create({
      data: {
        user: { connect: { id: userId } },
        group: { connect: { id: groupId } },
      },
    });
  }

  async removeUserFromGroup(userId: string, groupId: string) {
    await this.prismaService.userInGroup.delete({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId,
        },
      },
    });
  }
}