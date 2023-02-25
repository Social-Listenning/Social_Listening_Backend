import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateRoleDTO } from '../dtos/createRole.dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async createRole(role: CreateRoleDTO) {
    return this.prismaService.role.create({ data: role });
  }

  async getAllRole() {
    return this.prismaService.role.findMany();
  }

  async getRoleByRoleName(roleName: string) {
    return this.prismaService.role.findFirst({ where: { roleName: roleName } });
  }

  async getRoleById(roleId: string) {
    return this.prismaService.role.findFirst({ where: { id: roleId } });
  }
}
