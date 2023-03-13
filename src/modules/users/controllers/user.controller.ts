import { PagedData } from './../../../common/models/paging/pagedData.dto';
import { UserInGroupService } from './../services/userInGroup.service';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { RoleService } from 'src/modules/roles/services/role.service';
import { FilesInterceptor } from 'src/modules/files/interceptors/file.interceptor';
import { v4 as uuidv4 } from 'uuid';
import { ImportUserQueueService } from 'src/modules/queue/services/importUser.queue.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly groupService: SocialGroupService,
    private readonly userInGroupService: UserInGroupService,
    private readonly importUserQueueService: ImportUserQueueService,
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

  @Post()
  @UseGuards(PermissionGuard(UserPerm.GetAllUser.permission))
  async getAllUsers(@Req() request: RequestWithUser, @Body() page: UserPage) {
    const result = new PagedData<object>(page);

    const data = this.advancedFilteringService.createFilter(page);
    const listResult = await this.userService.findUser(data);

    result.data = listResult;
    result.page.totalElement = await this.userService.countUser();

    return result;
  }

  @Post('/all')
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

      result.data = listResult;
      result.page.totalElement = await this.userService.countUserWithGroup(
        group.id,
      );

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('/create/admin')
  @UseGuards(PermissionGuard(UserPerm.CreateAdminAccount.permission))
  async createAdminAccount(@Body() data: CreateEmployeeDTO) {
    const result = new ReturnResult<User>();
    try {
      const role = await this.roleService.getRoleById(data.roleId);
      if (role.roleName !== 'ADMIN')
        throw new Error(`You cannot create account with role ${role.roleName}`);

      const userExists = await this.userService.getUserByEmail(data.email);
      if (userExists)
        throw new Error(`You cannot create account with email ${data.email}`);

      const userCreated = await this.userService.createEmployee(data);
      if (userCreated.message !== null) throw new Error(userCreated.message);

      result.result = userCreated.result;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @Post('/import')
  @UseGuards(PermissionGuard(UserPerm.ImportUser.permission))
  @UseInterceptors(
    FilesInterceptor({
      fieldName: 'file',
      path: '/user/import',
      fileFilter: (request, file, callback) => {
        callback(null, true);
      },
      fileName: function (req, file, cb) {
        let uuid = uuidv4();
        uuid = uuid.toString().replace('-');
        const newFileName = `${uuid.substr(0, 10)}_${file.originalname}`;
        cb(null, newFileName);
      },
    }),
  )
  async importUser(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = request.user;
    if (user.role === 'ADMIN') {
      const result = new ReturnResult<boolean>();
      result.message = `You cannot allow to import file`;
      return result;
    }

    await this.userService.saveFile(file, user.id);

    return this.importUserQueueService.addFileToQueue({
      file: file,
      owner: user.id,
    });
  }
}
