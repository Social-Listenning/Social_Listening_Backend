import { Module } from '@nestjs/common';
import { RoleService } from './services/role.service';
import { PrismaModule } from './../../config/database/database.config.module';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [PrismaModule, PermissionModule],
  controllers: [],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
