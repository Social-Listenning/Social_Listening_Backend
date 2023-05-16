import { PrismaService } from 'src/config/database/database.config.service';
import { HotQueueDTO } from '../dtos/hotQueue.dto';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HotQueueService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserInHotQueue(senderId: string) {
    try {
      const user = await this.prismaService.userInHotQueue.findFirst({
        where: { senderId: senderId, delete: false },
      });
      return user;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async startHotQueue(data: HotQueueDTO) {
    try {
      const createdData = await this.prismaService.userInHotQueue.create({
        data: data,
      });
      return createdData;
    } catch (error) {
      console.log(error);
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async stopHotQueue(data: HotQueueDTO) {
    try {
      const user = await this.findUserInHotQueue(data.senderId);
      if (!user) throw new Error();

      const deletedData = await this.prismaService.userInHotQueue.update({
        where: { id: user.id },
        data: { delete: true },
      });
      return deletedData;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
