import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateUserDTO } from '../dtos/createUser.dto';
import { CreateUserInput } from '../dtos/createUser.input';
import { RoleService } from 'src/modules/roles/services/role.service';
import { comparePassword, hashedPasword } from 'src/utils/hashPassword';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaError } from 'src/utils/PrismaError';
import { excludeData } from 'src/utils/excludeData';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { User } from '../model/user.model';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { excludeUser, excludeUsers } from '../model/exclude.model';
import { RolePermissionService } from 'src/modules/permission/services/rolePermission.service';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDTO } from 'src/modules/auth/dtos/updatePassword.dto';
import { UpdateAccountDTO } from 'src/modules/auth/dtos/updateAccount.dto';
import { CreateEmployeeDTO } from '../dtos/createEmployee.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly roleService: RoleService,
    private readonly rolePermissionService: RolePermissionService,
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
        'refreshToken',
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

  async getUserInfo(userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
      include: { role: true },
    });
    const newData = excludeData(user, excludeUser);
    const roleName = newData.role.roleName;
    const listPermission =
      await this.rolePermissionService.getAllPermissionOfRole(newData.role.id);
    return {
      ...newData,
      role: roleName,
      permissions: listPermission,
    };
  }

  async setRefreshToken(refreshToken: string, userId: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async getUserByToken(refreshToken: string, userId: string) {
    const user = await this.getUserById(userId);

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

    if (isMatch) return user;
    else return null;
  }

  async updatePassword(userId: string, data: UpdatePasswordDTO) {
    const result = new ReturnResult<boolean>();
    try {
      const user = await this.prismaService.user.findFirst({
        where: { id: userId },
      });

      const isMatch = await comparePassword(data.oldPassword, user.password);
      if (!isMatch) throw new Error();

      const hashedPassword = await hashedPasword(data.newPassword);
      await this.prismaService.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      result.result = true;
    } catch (error) {
      result.message = 'Old Password does not match';
    }
    return result;
  }

  async removeToken(userId: string) {
    const result = new ReturnResult<boolean>();
    try {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
      result.result = true;
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  async resetPassword(userId: string, password: string) {
    const result = new ReturnResult<boolean>();
    try {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { password: await hashedPasword(password) },
      });
      result.result = true;
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  async updateAccount(userId: string, data: UpdateAccountDTO) {
    const result = new ReturnResult<User>();
    try {
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          email: data.email,
          userName: data.userName,
          fullName: data.fullName,
          phoneNumber: data?.phoneNumber,
        },
      });

      const user = await this.getUserById(userId);
      result.result = excludeData(user, [
        'password',
        'createdAt',
        'updatedAt',
        'roleId',
        'deleteAt',
        'refreshToken',
      ]);
    } catch (error) {
      console.log(error);
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  async createEmployee(data: CreateEmployeeDTO) {
    const result = new ReturnResult<User>();
    try {
      const hashedPassword = await hashedPasword(data.password);

      const userCreated: CreateUserInput = {
        email: data.email,
        userName: data.email,
        fullName: data.email,
        password: hashedPassword,
        roleId: data.roleId,
      };
      const user = await this.prismaService.user.create({
        data: {
          ...userCreated,
          isActive: true,
        },
      });
      result.result = excludeData(user, [
        'password',
        'createdAt',
        'updatedAt',
        'roleId',
        'deleteAt',
        'refreshToken',
      ]);
    } catch (error) {
      result.message = ResponseMessage.MESSAGE_TECHNICAL_ISSUE;
    }
    return result;
  }

  async removeAccount(userId: string) {
    return await this.prismaService.user.delete({
      where: { id: userId },
    });
  }

  async findUser(page) {
    const listUser = await this.prismaService.user.findMany({
      where: page.filter,
      orderBy: page.orders,
      include: {
        role: true,
      },
      skip: (page.pageNumber - 1) * page.size,
      take: page.size,
    });

    return listUser.map((user) => excludeData(user, excludeUsers));
  }

  async countUser() {
    return await this.prismaService.user.count();
  }

  async findUserWithGroup(page) {
    const listUser = await this.prismaService.user.findMany({
      where: page.filter,
      orderBy: page.orders,
      include: {
        role: true,
        socialGroup: true,
      },
      skip: (page.pageNumber - 1) * page.size,
      take: page.size,
    });

    return listUser.map((user) => {
      return {
        ...excludeData(user, excludeUsers),
        socialGroup: undefined,
      };
    });
  }

  async countUserWithGroup(groupId: string) {
    return await this.prismaService.user.count({
      where: { socialGroup: { id: groupId } },
    });
  }
}
