import { PrismaModule } from 'src/config/database/database.config.module';
import { SocketModule } from '../sockets/socket.module';
import { Module } from '@nestjs/common';
import { SocialLogService } from './services/socialLog.service';

@Module({
  imports: [SocketModule, PrismaModule],
  controllers: [],
  providers: [SocialLogService],
  exports: [SocialLogService],
})
export class SocialLogModule {}
