import { Module } from '@nestjs/common';
import { PrismaModule } from './../../config/database/database.config.module';
import { SocialGroupService } from './services/socialGroup.service';
import { SocialGroupController } from './controllers/socialGroup.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SocialGroupController],
  providers: [SocialGroupService],
  exports: [SocialGroupService],
})
export class SocialGroupModule {}
