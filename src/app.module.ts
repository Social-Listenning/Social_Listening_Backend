import { RoleModule } from './modules/roles/role.module';
import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/user.module';
import { AppService } from './startup.service';
import { AuthModule } from './modules/auth/auth.module';
import { SettingModule } from './modules/setting/setting.module';

@Module({
  imports: [RoleModule, UserModule, AuthModule, SettingModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
