import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailWorker } from './workers/email.worker';
import { EmailQueueService } from './services/email.queue.service';
import { MailModule } from '../mail/mail.module';
import { ImportUserQueueService } from './services/importUser.queue.service';
import { ImportUserWorker } from './workers/importUser.worker';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue(
      {
        name: 'email',
      },
      {
        name: 'importUser',
      },
    ),
    MailModule,
    forwardRef(() => UserModule),
  ],
  providers: [
    EmailQueueService,
    EmailWorker,
    ImportUserQueueService,
    ImportUserWorker,
  ],
  exports: [EmailQueueService, ImportUserQueueService],
})
export class QueueModule {}
