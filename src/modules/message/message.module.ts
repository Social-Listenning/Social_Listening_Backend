import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/config/database/database.config.module';
import { SocialSenderModule } from '../socialSender/socialSender.module';
import { MessageService } from './services/message.service';
import { MessageController } from './controllers/message.controller';
import { SocialGroupModule } from '../socialGroups/socialGroup.module';
import { UserModule } from '../users/user.module';

@Module({
  imports: [PrismaModule, SocialSenderModule, SocialGroupModule, UserModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
