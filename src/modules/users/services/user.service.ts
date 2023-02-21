import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateUserDTO } from '../dtos/createUser.dto';
import { CreateUserInput } from '../dtos/createUser.input';
import { RoleService } from 'src/modules/roles/services/role.service';
import { hashedPasword } from 'src/utils/hashPassword';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaError } from 'src/utils/PrismaError';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly roleService: RoleService,
  ) {}

  async createUser(user: CreateUserDTO, fromStartupApp = false) {
    const userRole = await this.roleService.getRoleByRoleName(
      fromStartupApp ? 'ADMIN' : 'OWNER',
    );
    const hashedPassword = await hashedPasword(user.password);

    const userCreated: CreateUserInput = {
      email: user.email,
      userName: user.email,
      fullName: user.email,
      password: hashedPassword,
      roleId: userRole.id,
    };
    return this.prismaService.user.create({ data: userCreated });
  }

  async getUserById(userId: string) {
    return this.prismaService.user.findFirst({ where: { id: userId } });
  }

  async getUserByEmail(email: string) {
    return this.prismaService.user.findFirst({ where: { email: email } });
  }

  async activeAccount(userId: string) {
    try {
      return await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          isActive: true,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === PrismaError.RecordDoesNotExist
      ) {
        throw new NotFoundException(`Not found user with id: ${userId}`);
      }
      throw error;
    }
  }
}
