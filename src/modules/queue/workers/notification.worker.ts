import {
  Processor,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
} from '@nestjs/bull';
import { Logger, forwardRef, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationModel } from 'src/modules/notifications/model/notification.model';
import { NotificationService } from 'src/modules/notifications/services/notification.service';
import { SocketService } from 'src/modules/sockets/services/socket.service';
import { NotificationQueueService } from '../services/notification.queue.service';

@Processor('notification')
export class NotificationWorker {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => SocketService))
    private readonly socketService: SocketService,

    private readonly notificationQueue: NotificationQueueService,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    // this.logger.log(`Completed job ${job.id} of type ${job.name}`);
    // this.logger.log(`Result: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
    );

    // const { to, subject, body, retryCount } = job.data;
    // if (retryCount < 3) {
    //   this.logger.log(`Retrying send notification to ${to}`);
    //   await this.mailService.sendEmail(to, subject, body, retryCount + 1);
    // } else {
    //   this.logger.log(`Max retries reached for sending notification to ${to}`);
    // }
  }

  @Process('pushNotification')
  async pushNotification(
    job: Job<{ notification: NotificationModel }>,
  ): Promise<boolean> {
    const { notification } = job.data;
    const userId = notification.userId;

    const socketToken = await this.socketService.getConnection(userId);

    if (socketToken) {
      await this.notificationService.pushNotification(
        notification,
        socketToken,
      );
    } else {
      notification.maxAttempt -= 1;
      this.logger.log(`Retrying send notification with id: ${notification.id}`);
      if (notification.maxAttempt > 0)
        this.notificationQueue.addNotificationToQueue(notification);
      else
        this.logger.log(
          `Max retries reached for sending notification with id ${notification.id}`,
        );
    }

    return true;
  }
}
