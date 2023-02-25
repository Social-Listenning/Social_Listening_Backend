import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateUserDTO } from '../dtos/createUser.dto';
import { CreateUserInput } from '../dtos/createUser.input';
import { RoleService } from 'src/modules/roles/services/role.service';
import { hashedPasword } from 'src/utils/hashPassword';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaError } from 'src/utils/PrismaError';
import { excludeData } from 'src/utils/excludeData';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { User } from '../model/user.model';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly roleService: RoleService,
  ) {}

  async createUser(userData: CreateUserDTO, fromStartupApp = false) {
    const result = new ReturnResult<User>();
    try {
      const userRole = await this.roleService.getRoleByRoleName(
        fromStartupApp ? 'ADMIN' : 'OWNER',
      );
      const hashedPassword = await hashedPasword(userData.password);

      const userCreated: CreateUserInput = {
        email: userData.email,
        userName: userData.email,
        fullName: userData.email,
        password: hashedPassword,
        roleId: userRole.id,
      };
      const user = await this.prismaService.user.create({
        data: userCreated,
      });
      result.result = excludeData(user, [
        'password',
        'createdAt',
        'updatedAt',
        'roleId',
        'deleteAt',
        'isActive',
      ]);
    } catch (error) {
      this.logger.error(`Function: CreateUser, Error: ${error.message}`);
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  async getUserById(userId: string) {
    return this.prismaService.user.findFirst({ where: { id: userId } });
  }

  async getUserByEmail(email: string) {
    return this.prismaService.user.findFirst({ where: { email: email } });
  }

  async activeAccount(userId: string) {
    try {
      await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          isActive: true,
        },
      });
      return true;
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
