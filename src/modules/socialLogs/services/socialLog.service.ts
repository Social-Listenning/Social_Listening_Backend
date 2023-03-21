import { plainToClass } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PrismaService } from 'src/config/database/database.config.service';
import { SocialLogModel } from '../models/socialLog.model';
import { CreateSocialLogDTO } from '../dtos/createSocialLog.dto';

@Injectable()
@WebSocketGateway()
export class SocialLogService {
  @WebSocketServer()
  server: Server;

  constructor(private readonly prismaService: PrismaService) {}

  async saveSocialLog(data: CreateSocialLogDTO) {
    const dataCreated = await this.prismaService.socialTabLog.create({
      data: data,
    });

    const socialLogData = plainToClass(SocialLogModel, dataCreated);
    this.pushSocialLog(socialLogData, socialLogData.tabId);
  }

  private async pushSocialLog(socialLog: SocialLogModel, roomId: string) {
    this.server.sockets.to(roomId).emit('sendSocialLog', socialLog);
  }
}
