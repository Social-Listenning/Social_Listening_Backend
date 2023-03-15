import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class NotificationQueueService {
  constructor(@InjectQueue('notification') private readonly queue: Queue) {}

  async addNotificationToQueue(data: any) {
    await this.queue.add('pushNotification', { notification: data });
  }
}
