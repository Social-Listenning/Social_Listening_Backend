import { RoleModule } from './modules/roles/role.module';
import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/user.module';
import { AppService } from './startup.service';
import { AuthModule } from './modules/auth/auth.module';
import { SettingModule } from './modules/setting/setting.module';
import { MailModule } from './modules/mail/mail.module';
import { QueueModule } from './modules/queue/queue.module';

@Module({
  imports: [
    RoleModule,
    UserModule,
    AuthModule,
    SettingModule,
    MailModule,
    QueueModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
