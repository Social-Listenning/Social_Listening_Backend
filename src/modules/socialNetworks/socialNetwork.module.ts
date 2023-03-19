import { PrismaModule } from 'src/config/database/database.config.module';
import { SocialGroupModule } from '../socialGroups/socialGroup.module';
import { Module } from '@nestjs/common';
import { SocialNetworkController } from './controllers/socialNetwork.controller';
import { SocialNetworkService } from './services/socialNetwork.service';

@Module({
  imports: [PrismaModule, SocialGroupModule],
  controllers: [SocialNetworkController],
  providers: [SocialNetworkService],
  exports: [SocialNetworkService],
})
export class SocialNetworkModule {}
