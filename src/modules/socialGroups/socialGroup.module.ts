import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from './../../config/database/database.config.module';
import { SocialGroupService } from './services/socialGroup.service';
import { SocialGroupController } from './controllers/socialGroup.controller';
import { SocialTabService } from './services/socialTab.service';
import { SocialTabController } from './controllers/socialTab.controller';
import { SocialNetworkModule } from '../socialNetworks/socialNetwork.module';

@Module({
  imports: [PrismaModule, forwardRef(() => SocialNetworkModule)],
  controllers: [SocialGroupController, SocialTabController],
  providers: [SocialGroupService, SocialTabService],
  exports: [SocialGroupService, SocialTabService],
})
export class SocialGroupModule {}
