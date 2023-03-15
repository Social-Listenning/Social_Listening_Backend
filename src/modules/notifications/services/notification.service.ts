import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/config/database/database.config.service';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { NotificationDTO } from '../dtos/notification.dto';
import { NotificationQueueService } from 'src/modules/queue/services/notification.queue.service';
import { plainToClass } from 'class-transformer';
import { NotificationModel } from '../model/notification.model';

@Injectable()
@WebSocketGateway()
export class NotificationService {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => NotificationQueueService))
    private readonly notificationQueue: NotificationQueueService,

    private readonly prismaService: PrismaService,
  ) {}

  async getUserFromSocket(socket: Socket) {
    try {
      const authToken = socket.handshake.auth.token;
      // const authToken = socket.handshake.headers.authorization;
      if (!authToken) throw new Error(`Invalid credentials`);
      const userId = await this.authService.getUserFromAuthToken(authToken);

      if (!userId) {
        socket.disconnect();
        throw new Error('Invalid credentials');
      }

      return userId;
    } catch (error) {
      return error.message;
    }
  }

  async createNotification(notificationDTO: NotificationDTO, sendTo: string) {
    const notification = await this.prismaService.notification.create({
      data: { ...notificationDTO, userId: sendTo },
    });

    const notificationModel = plainToClass(NotificationModel, notification);

    await this.sendNotification(notificationModel);
    return notification;
  }

  async pushNotification(notification: NotificationModel, socketToken: string) {
    this.server.sockets.to(socketToken).emit('sendNotification', notification);
  }

  private async sendNotification(notification) {
    return this.notificationQueue.addNotificationToQueue(notification);
  }
}
