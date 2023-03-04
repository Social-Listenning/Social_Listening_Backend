import { SocialGroupModule } from './../socialGroups/socialGroup.module';
import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { PrismaModule } from 'src/config/database/database.config.module';
import { RoleModule } from '../roles/role.module';
import { PermissionModule } from '../permission/permission.module';
import { UserInGroupService } from './services/userInGroup.service';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [PrismaModule, RoleModule, PermissionModule, SocialGroupModule],
  controllers: [UserController],
  providers: [UserService, UserInGroupService],
  exports: [UserService, UserInGroupService],
})
export class UserModule {}
