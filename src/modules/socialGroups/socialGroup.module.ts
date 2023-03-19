import { Module } from '@nestjs/common';
import { PrismaModule } from './../../config/database/database.config.module';
import { SocialGroupService } from './services/socialGroup.service';
import { SocialGroupController } from './controllers/socialGroup.controller';
import { SocialTabService } from './services/socialTab.service';

@Module({
  imports: [PrismaModule],
  controllers: [SocialGroupController],
  providers: [SocialGroupService, SocialTabService],
  exports: [SocialGroupService, SocialTabService],
})
export class SocialGroupModule {}
