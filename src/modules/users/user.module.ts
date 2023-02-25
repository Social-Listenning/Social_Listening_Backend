import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { PrismaModule } from 'src/config/database/database.config.module';
import { RoleModule } from '../roles/role.module';

@Module({
  imports: [PrismaModule, RoleModule],
  controllers: [],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
