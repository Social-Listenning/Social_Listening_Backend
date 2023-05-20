import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { HotQueueService } from '../services/hotQueue.service';
import { HotQueueDTO } from '../dtos/hotQueue.dto';

@WebSocketGateway()
export class WorkflowGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly hotQueueService: HotQueueService) {}

  @SubscribeMessage('startHotQueue')
  async startHotQueue(@MessageBody() hotQueueData: HotQueueDTO) {
    try {
      await this.hotQueueService.startHotQueue(hotQueueData);
    } catch (error) {
      console.error(error);
    }
  }

  @SubscribeMessage('stopHotQueue')
  async stopHotQueue(@MessageBody() hotQueueData: HotQueueDTO) {
    try {
      await this.hotQueueService.stopHotQueue(hotQueueData);
    } catch (error) {
      console.error(error);
    }
  }

  async messageSupport(senderId: string, roomId: string) {
    this.server.sockets.to(roomId).emit('messageSupport', senderId);
  }
}
