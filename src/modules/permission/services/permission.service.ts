import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreatePermissionDTO } from '../dtos/createPermission.dto';
import { UpdatePermissionDTO } from '../dtos/updatePermission.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaError } from 'src/utils/PrismaError';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { excludeData } from 'src/utils/excludeData';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { formatString } from 'src/utils/formatString';
import { Permission } from '../model/permission.model';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async createPermission(permission: CreatePermissionDTO) {
    return await this.prismaService.permission.create({ data: permission });
  }

  async editPermission(permission: UpdatePermissionDTO) {
    const result = new ReturnResult<Permission>();
    try {
      const updatedPermisison = await this.prismaService.permission.update({
        where: {
          id: permission.id,
        },
        data: permission,
      });
      result.result = excludeData(updatedPermisison, ['deleted']);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === PrismaError.RecordDoesNotExist
      ) {
        result.message = formatString(ResponseMessage.MESSAGE_ITEM_NOT_EXIST, [
          'permission',
          permission.id,
        ]);
      }
    }
    return result;
  }

  async getPermissionByName(permissionName: string) {
    return await this.prismaService.permission.findFirst({
      where: { permission: permissionName },
    });
  }
}