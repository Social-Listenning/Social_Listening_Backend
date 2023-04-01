import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { AssignUserDTO } from '../dtos/assignUser.dto';
import { RoleService } from 'src/modules/roles/services/role.service';
import { UpdateRoleUserDTO } from '../dtos/updateRoleUser.dto';
import { SocialLogService } from 'src/modules/socialLogs/services/socialLog.service';
import { UserService } from './user.service';
import { SocialTabService } from 'src/modules/socialGroups/services/socialTab.service';

@Injectable()
export class UserInTabService {
  managerRole = null;
  supporterRole = null;

  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly socialTabService: SocialTabService,
    private readonly socialLogService: SocialLogService,
  ) {
    this.initRole();
  }

  async initRole() {
    this.managerRole = await this.roleService.getRoleByRoleName('MANAGER');
    this.supporterRole = await this.roleService.getRoleByRoleName('SUPPORTER');
  }

  async addUserToTab(userId: string, tabId: string, roleId: string) {
    const tab = await this.socialTabService.getSocialTabById(tabId);
    const user = await this.userService.getUserById(userId);

    const dataCreated = await this.prismaService.userInTab.create({
      data: {
        user: { connect: { id: userId } },
        socialTab: { connect: { id: tabId } },
        role: { connect: { id: roleId } },
      },
    });

    await this.socialLogService.saveSocialLog({
      tabId: tabId,
      title: 'Add User to Tab',
      body: `User #${user.userName} is added to tab #${tab.name}`,
      activity: 'Add User',
    });

    return dataCreated;
  }

  async assignUsers(data: AssignUserDTO) {
    const listUser = data.users;
    const listTab = data.tabs;
    const fakeDB = new Map<string, object>();

    const role = await this.roleService.getRoleByRoleName('SUPPORTER');

    Promise.all(
      listUser.map(async (userId) => {
        const user = await this.userService.getUserById(userId);
        fakeDB[userId] = user;
      }),
    );

    Promise.all(
      listTab.map(async (tabId) => {
        const tab = await this.socialTabService.getSocialTabById(tabId);
        fakeDB[tabId] = tab;
      }),
    );

    for (const userId of listUser) {
      for (const tabId of listTab) {
        try {
          await this.addUserToTab(userId, tabId, role.id);

          const tab = fakeDB[tabId];
          const user = fakeDB[userId];

          await this.socialLogService.saveSocialLog({
            tabId: tabId,
            title: 'Add User to Tab',
            body: `User #${user.userName} is added to tab #${tab.name}`,
            activity: 'Add User',
          });
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

        const user = await this.userService.getUserById(managerOfTab.userId);
        await this.socialLogService.saveSocialLog({
          tabId: data.tabId,
          title: `Update Role of User`,
          body: `User #${user.userName} is assigned the ${this.supporterRole.roleName} role`,
          activity: 'Update Role',
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

    const userData = await this.userService.getUserById(user.userId);
    await this.socialLogService.saveSocialLog({
      tabId: data.tabId,
      title: `Update Role of User`,
      body: `User #${userData.userName} is assigned the ${this.managerRole.roleName} role`,
      activity: 'Update Role',
    });
  }

  private async getManagerOfTab(tabId: string) {
    const user = await this.prismaService.userInTab.findFirst({
      where: { tabId: tabId, roleId: this.managerRole.id, delete: false },
    });

    return user;
  }
}
