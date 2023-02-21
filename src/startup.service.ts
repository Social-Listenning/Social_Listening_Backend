import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RoleService } from './modules/roles/services/role.service';
import { UserService } from './modules/users/services/user.service';
import { CreateRoleDTO } from './modules/roles/dtos/createRole.dto';
import { CreateUserDTO } from './modules/users/dtos/createUser.dto';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  adminInfo: CreateUserDTO;
  listDefaultRole: CreateRoleDTO[];

  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService,
  ) {
    this.listDefaultRole = [
      { roleName: 'ADMIN', level: 5 },
      { roleName: 'OWNER', level: 4 },
    ];
    this.adminInfo = {
      email: 'admin@social-listening.com',
      password: '@N0tH3r_Pa55',
    };
  }

  async onModuleInit() {
    await this.createDefaultRole();
    await this.createDefauttAdmin();
  }

  private async createDefaultRole() {
    await Promise.all(
      this.listDefaultRole.map(async (role) => {
        const existRole = await this.roleService.getRoleByRoleName(
          role.roleName,
        );

        if (!existRole) await this.roleService.createRole(role);
      }),
    );
    this.logger.log('Creating new roles');
  }

  private async createDefauttAdmin() {
    const existingUser = await this.userService.getUserByEmail(
      this.adminInfo.email,
    );

    if (!existingUser) {
      const newUser = await this.userService.createUser(this.adminInfo, true);
      await this.userService.activeAccount(newUser.id);
    }

    this.logger.log('Creating new user');
  }
}
