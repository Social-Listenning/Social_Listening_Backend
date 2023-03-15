import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from '../services/notification.service';
import { SocketService } from 'src/modules/sockets/services/socket.service';

@WebSocketGateway()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly connectStore: SocketService,
  ) {}

  async handleConnection(socket: Socket) {
    const userId = await this.notificationService.getUserFromSocket(socket);
    if (userId === 'Invalid credentials') socket.disconnect();
    else {
      const socketToken = socket.id;
      await this.connectStore.connect({
        userId: userId,
        socketToken: socketToken,
      });
      this.logger.log(`User with id: ${userId} connect to Socket`);
    }
  }

  async handleDisconnect(socket: Socket) {
    const userId = await this.notificationService.getUserFromSocket(socket);
    if (userId === 'Invalid credentials') socket.disconnect();
    else {
      await this.connectStore.disconnect(userId);
    }
    this.logger.log(`User with id: ${userId} disconnect Socket`);
  }

  @SubscribeMessage('receiveNotification')
  async receiveNotification(@MessageBody() notificationId: string) {
    if (!isNaN(Number(notificationId))) {
      const id = Number.parseInt(notificationId);
      this.notificationService.receiveNotification(id);
    }
  }

  @SubscribeMessage('clickNotification')
  async clickNotification(@MessageBody() notificationId: string) {
    if (!isNaN(Number(notificationId))) {
      const id = Number.parseInt(notificationId);
      this.notificationService.clickNotification(id);
    }
  }
}
