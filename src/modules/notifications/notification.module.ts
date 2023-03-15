import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SettingModule } from '../setting/setting.module';
import { NotificationGateway } from './gateways/notification.gateway';
import { NotificationService } from './services/notification.service';
import { SocketModule } from '../sockets/socket.module';
import { QueueModule } from '../queue/queue.module';
import { PrismaModule } from 'src/config/database/database.config.module';
import { NotificationController } from './controllers/notification.controller';

@Module({
  imports: [
    SocketModule,
    SettingModule,
    PrismaModule,
    forwardRef(() => QueueModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationGateway, NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
