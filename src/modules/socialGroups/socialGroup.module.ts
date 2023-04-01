import { Module } from '@nestjs/common';
import { PrismaModule } from './../../config/database/database.config.module';
import { SocialGroupService } from './services/socialGroup.service';
import { SocialGroupController } from './controllers/socialGroup.controller';
import { SocialTabService } from './services/socialTab.service';
import { SocialTabController } from './controllers/socialTab.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SocialGroupController, SocialTabController],
  providers: [SocialGroupService, SocialTabService],
  exports: [SocialGroupService, SocialTabService],
})
export class SocialGroupModule {}
