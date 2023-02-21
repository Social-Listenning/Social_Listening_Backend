import { RoleModule } from './modules/roles/role.module';
import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/user.module';
import { AppService } from './startup.service';

@Module({
  imports: [RoleModule, UserModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
