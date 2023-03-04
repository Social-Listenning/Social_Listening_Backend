import { Module } from '@nestjs/common';
import { PrismaModule } from './../../config/database/database.config.module';
import { SocialGroupService } from './services/socialGroup.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [SocialGroupService],
  exports: [SocialGroupService],
})
export class SocialGroupModule {}
