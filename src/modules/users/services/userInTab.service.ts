import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { AssignUserDTO } from '../dtos/assignUser.dto';
import { RoleService } from 'src/modules/roles/services/role.service';
import { UpdateRoleUserDTO } from '../dtos/updateRoleUser.dto';

@Injectable()
export class UserInTabService {
  managerRole = null;
  supporterRole = null;

  constructor(
    private readonly roleService: RoleService,
    private readonly prismaService: PrismaService,
  ) {
    this.initRole();
  }

  async initRole() {
    this.managerRole = await this.roleService.getRoleByRoleName('MANAGER');
    this.supporterRole = await this.roleService.getRoleByRoleName('SUPPORTER');
  }

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

    const role = await this.roleService.getRoleByRoleName('SUPPORTER');

    for (const userId of listUser) {
      for (const tabId of listTab) {
        try {
          await this.addUserToTab(userId, tabId, role.id);
        } catch (error) {}
      }
    }
  }

  async updateRoleUser(data: UpdateRoleUserDTO) {
    if (data.roleId === this.managerRole.id) {
      const managerOfTab = await this.getManagerOfTab(data.tabId);
      if (managerOfTab) {
        await this.prismaService.userInTab.update({
          where: { id: managerOfTab.id },
          data: { roleId: this.supporterRole.id },
        });
      }
    }

    const user = await this.prismaService.userInTab.findFirst({
      where: { tabId: data.tabId, userId: data.userId, delete: false },
    });

    await this.prismaService.userInTab.update({
      data: { roleId: data.roleId },
      where: { id: user.id },
    });
  }

  private async getManagerOfTab(tabId: string) {
    const user = await this.prismaService.userInTab.findFirst({
      where: { tabId: tabId, roleId: this.managerRole.id, delete: false },
    });

    return user;
  }
}
