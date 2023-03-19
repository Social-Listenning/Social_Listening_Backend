import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { AssignUserDTO } from '../dtos/assignUser.dto';
import { RoleService } from 'src/modules/roles/services/role.service';

@Injectable()
export class UserInTabService {
  constructor(
    private readonly roleSerice: RoleService,
    private readonly prismaService: PrismaService,
  ) {}

  async addUserToTab(userId: string, tabId: string, roleId: string) {
    return await this.prismaService.userInTab.create({
      data: {
        user: { connect: { id: userId } },
        socialTab: { connect: { id: tabId } },
        role: { connect: { id: roleId } },
      },
    });
  }

  async assignUsers(data: AssignUserDTO) {
    const listUser = data.users;
    const listTab = data.tabs;

    const role = await this.roleSerice.getRoleByRoleName('SUPPORTER');

    for (const userId of listUser) {
      for (const tabId of listTab) {
        try {
          await this.addUserToTab(userId, tabId, role.id);
        } catch (error) {}
      }
    }
  }
}
