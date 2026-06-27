import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('email-send')
export class EmailSendProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailSendProcessor.name);

  process(job: Job): Promise<void> {
    this.logger.log(`Processing email-send job ${job.id} (${job.name})`);
    switch (job.name) {
      case 'send-email':
        this.handleSendEmail(job.data as Record<string, unknown>);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
    return Promise.resolve();
  }

  private handleSendEmail(data: Record<string, unknown>): void {
    this.logger.log(`Sending email to: ${String(data['to'])}`);
  }
}
