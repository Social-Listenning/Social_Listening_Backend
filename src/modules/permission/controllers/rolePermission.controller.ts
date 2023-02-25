import { Body, Controller, Post } from '@nestjs/common';
import { RolePermissionService } from '../services/rolePermission.service';
import { RolePermissionDTO } from '../dtos/rolePermission.dto';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { formatString } from 'src/utils/formatString';

@Controller('permission')
export class PermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post('assign')
  async assignPermission(
    @Body() data: RolePermissionDTO,
  ): Promise<ReturnResult<boolean>> {
    const result = new ReturnResult<boolean>();
    try {
      const { roleId, permissionId } = data;
      const existingRolePermission =
        await this.rolePermissionService.getRolePermission(
          roleId,
          permissionId,
        );

      if (!existingRolePermission) {
        await this.rolePermissionService.assignPermissionToRole(
          roleId,
          permissionId,
        );
        result.result = true;
      } else throw new Error();
    } catch (error) {
      result.message = formatString(ResponseMessage.MESSAGE_ITEM_EXIST, [
        'RolePermission',
      ]);
    }
    return result;
  }

  @Post('remove')
  async removePermission(@Body() data: RolePermissionDTO) {
    const result = new ReturnResult<boolean>();
    try {
      const { roleId, permissionId } = data;
      const existingRolePermission =
        await this.rolePermissionService.getRolePermission(
          roleId,
          permissionId,
        );

      if (existingRolePermission) {
        await this.rolePermissionService.removePermissionFromRole(
          roleId,
          permissionId,
        );
        result.result = true;
      } else throw new Error();
    } catch (error) {
      result.message = `The role permission is not existed or deleted.`;
    }
    return result;
  }
}
