import { SocialGroupModule } from './../socialGroups/socialGroup.module';
import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { PrismaModule } from 'src/config/database/database.config.module';
import { RoleModule } from '../roles/role.module';
import { PermissionModule } from '../permission/permission.module';
import { UserInGroupService } from './services/userInGroup.service';
import { UserController } from './controllers/user.controller';
import { FileModule } from '../files/file.module';
import { SettingModule } from '../setting/setting.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    PrismaModule,
    RoleModule,
    PermissionModule,
    SocialGroupModule,
    SettingModule,
    FileModule,
    QueueModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserInGroupService],
  exports: [UserService, UserInGroupService],
})
export class UserModule {}
