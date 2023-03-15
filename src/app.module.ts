import { RoleModule } from './modules/roles/role.module';
import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/user.module';
import { AppService } from './startup.service';
import { AuthModule } from './modules/auth/auth.module';
import { SettingModule } from './modules/setting/setting.module';
import { MailModule } from './modules/mail/mail.module';
import { QueueModule } from './modules/queue/queue.module';
import { PermissionModule } from './modules/permission/permission.module';
import { TokenModule } from './modules/token/token.module';
import { SocialGroupModule } from './modules/socialGroups/socialGroup.module';
import { FileModule } from './modules/files/file.module';
import { NotificationModule } from './modules/notifications/notification.module';

@Module({
  imports: [
    RoleModule,
    PermissionModule,
    UserModule,
    AuthModule,
    SettingModule,
    MailModule,
    QueueModule,
    TokenModule,
    SocialGroupModule,
    FileModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
