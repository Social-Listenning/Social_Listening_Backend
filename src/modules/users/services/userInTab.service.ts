import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';

@Injectable()
export class UserInTabService {
  constructor(private readonly prismaService: PrismaService) {}

  async addUserToTab(userId: string, tabId: string, roleId: string) {
    return await this.prismaService.userInTab.create({
      data: {
        user: { connect: { id: userId } },
        socialTab: { connect: { id: tabId } },
        role: { connect: { id: roleId } },
      },
    });
  }
}
