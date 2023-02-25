import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';

@Injectable()
export class RolePermissionService {
  private readonly logger = new Logger(RolePermissionService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async getRolePermission(roleId: string, permissionId: string) {
    return this.prismaService.role_Permission.findFirst({
      where: { roleId: roleId, permissionId: permissionId },
    });
  }

  async assignPermissionToRole(roleId: string, permissionId: string) {
    return this.prismaService.role_Permission.create({
      data: {
        role: { connect: { id: roleId } },
        permission: { connect: { id: permissionId } },
      },
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    try {
      await this.prismaService.role_Permission.delete({
        where: {
          roleId_permissionId: {
            roleId: roleId,
            permissionId: permissionId,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getAllPermissionOfRole(roleId: string) {
    const data = await this.prismaService.permission.findMany({
      where: {
        Role_Permission: {
          some: { roleId: roleId },
        },
      },
      select: { permission: true },
    });
    return data.map((permission) => permission.permission);
  }
}
