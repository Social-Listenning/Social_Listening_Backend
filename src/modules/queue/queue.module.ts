import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailWorker } from './workers/email.worker';
import { EmailQueueService } from './services/email.queue.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
    MailModule,
  ],
  providers: [EmailQueueService, EmailWorker],
  exports: [EmailQueueService],
})
export class QueueModule {}
