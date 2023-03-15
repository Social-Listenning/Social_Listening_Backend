import {
  Processor,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MailService } from 'src/modules/mail/service/mail.service';

@Processor('email')
export class EmailWorker {
  private readonly logger = new Logger(EmailWorker.name);

  constructor(private readonly mailService: MailService) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Completed job ${job.id} of type ${job.name}`);
    this.logger.log(`Result: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
    );

    const { to, subject, body, retryCount } = job.data;
    if (retryCount < 3) {
      this.logger.log(`Retrying email send to ${to}`);
      await this.mailService.sendEmail(to, subject, body, retryCount + 1);
    } else {
      this.logger.log(`Max retries reached for email to ${to}`);
    }
  }

  @Process('sendEmail')
  async sendEmail(
    job: Job<{
      to: string;
      subject: string;
      template: string;
      context: any;
      retryCount?: number;
    }>,
  ): Promise<boolean> {
    const { to, subject, template, context, retryCount = 0 } = job.data;
    const result = await this.mailService.sendEmail(
      to,
      subject,
      template,
      context,
      retryCount,
    );
    return result;
  }
}
