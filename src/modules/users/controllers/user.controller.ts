import { PagedData } from './../../../common/models/paging/pagedData.dto';
import { UserInGroupService } from './../services/userInGroup.service';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateEmployeeDTO } from '../dtos/createEmployee.dto';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { User } from '../model/user.model';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { UserPerm } from '../enum/permission.enum';
import { SocialGroupService } from 'src/modules/socialGroups/services/socialGroup.service';
import { EmailConfirmGuard } from 'src/modules/auth/guards/emailConfirm.guard';
import { UserPage } from '../dtos/userPage.dto';
import { AdvancedFilteringService } from 'src/config/database/advancedFiltering.service';
import { JWTAuthGuard } from 'src/modules/auth/guards/jwtAuth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly groupService: SocialGroupService,
    private readonly userInGroupService: UserInGroupService,
    private readonly advancedFilteringService: AdvancedFilteringService,
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

  @Post('/remove/:id')
  @UseGuards(EmailConfirmGuard)
  @UseGuards(PermissionGuard(UserPerm.RemoveUser.permission))
  async removeEmployee(@Req() request: RequestWithUser, @Param() { id }) {
    const user = request.user;
    const result = new ReturnResult<boolean>();

    try {
      const userExist = await this.userService.getUserById(id);
      if (!userExist) throw new Error(`User with id: ${id} is not exists`);

      const group = await this.groupService.getSocialGroupByManagerId(user.id);
      if (group.managerId === user.id)
        throw new Error(`Can not remove yourself from group`);

      await this.userInGroupService.removeUserFromGroup(userExist.id, group.id);
      await this.userService.removeAccount(userExist.id);

      result.result = true;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Get()
  @UseGuards(PermissionGuard(UserPerm.GetAllUser.permission))
  async getAllUsers(@Req() request: RequestWithUser, @Body() page: UserPage) {
    const result = new PagedData<object>(page);

    const data = this.advancedFilteringService.createFilter(page);
    const listResult = await this.userService.findUser(data);

    result.Data = listResult;
    result.Page.totalElement = await this.userService.countUser();

    return result;
  }

  @Get('/all')
  @UseGuards(JWTAuthGuard)
  async getAllUserWithGroup(
    @Req() request: RequestWithUser,
    @Body() page: UserPage,
  ) {
    const user = request.user;
    const result = new PagedData<object>(page);

    try {
      if (user.role !== 'OWNER')
        throw new Error(`You are not allowed to access this page`);

      const group = await this.groupService.getSocialGroupByManagerId(user.id);

      const data = this.advancedFilteringService.createFilter(page);
      data.filter.AND.push({
        socialGroup: {
          id: group.id,
        },
      });
      const listResult = await this.userService.findUserWithGroup(data);

      result.Data = listResult;
      result.Page.totalElement = await this.userService.countUserWithGroup(
        group.id,
      );

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
