import { Module } from '@nestjs/common';
import { RoleService } from './services/role.service';
import { PrismaModule } from './../../config/database/database.config.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
