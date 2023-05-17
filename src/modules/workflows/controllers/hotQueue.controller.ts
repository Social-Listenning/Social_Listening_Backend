import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { HotQueueService } from '../services/hotQueue.service';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { JWTAuthGuard } from 'src/modules/auth/guards/jwtAuth.guard';

@Controller('hotqueue')
export class HotQueueController {
  constructor(private readonly hotQueueService: HotQueueService) {}

  @Get('sender/:senderId')
  @UseGuards(JWTAuthGuard)
  async getHotQueueInfo(@Param('senderId') senderId: string) {
    const result = new ReturnResult<object>();
    try {
      const hotQueue = await this.hotQueueService.findUserInHotQueue(senderId);
      if (!hotQueue) {
        throw new Error(`Sender is not supported or is not in hot-queue`);
      }
      result.result = hotQueue;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }
}
