import { UserInGroupService } from './../services/userInGroup.service';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateEmployeeDTO } from '../dtos/createEmployee.dto';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { User } from '../model/user.model';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { UserPerm } from '../enum/permission.enum';
import { SocialGroupService } from 'src/modules/socialGroups/services/socialGroup.service';
import { EmailConfirmGuard } from 'src/modules/auth/guards/emailConfirm.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly groupService: SocialGroupService,
    private readonly userInGroupService: UserInGroupService,
  ) {}

  @Post('/create')
  @UseGuards(EmailConfirmGuard)
  @UseGuards(PermissionGuard(UserPerm.CreateUser.permission))
  async createEmployee(
    @Req() request: RequestWithUser,
    @Body() data: CreateEmployeeDTO,
  ) {
    let result = new ReturnResult<User>();
    let employeeData = null;
    const user = request.user;

    try {
      const userExist = await this.userService.getUserByEmail(data.email);
      if (userExist)
        throw new Error(`User with email ${data.email} already exists`);

      const group = await this.groupService.getSocialGroupByManagerId(user.id);

      const employee = await this.userService.createEmployee(data);
      if (employee.result === null) throw new Error(employee.message);
      else employeeData = employee.result;

      await this.userInGroupService.addUserToGroup(employeeData.id, group.id);
      result = employee;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }
}
