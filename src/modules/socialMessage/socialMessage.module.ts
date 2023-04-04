import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/config/database/database.config.module';
import { SocialMessageService } from './services/socialMessage.service';
import { SocialMessageController } from './controllers/socialMessage.controller';
import { SocialGroupModule } from '../socialGroups/socialGroup.module';
import { SocialPostService } from './services/socialPost.service';

@Module({
  imports: [PrismaModule, SocialGroupModule],
  controllers: [SocialMessageController],
  providers: [SocialMessageService, SocialPostService],
  exports: [SocialMessageService, SocialPostService],
})
export class SocialMessageModule {}
