import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_EMAIL_SEND } from '../queue.constants';

@Processor(QUEUE_EMAIL_SEND)
export class EmailSendProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailSendProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing email-send job ${job.id} (type: ${job.name})`);

    try {
      await job.updateProgress(25);
      // Render email template — consumed by BE-10
      await job.updateProgress(50);
      // Send via mailer transport
      await job.updateProgress(75);
      // Record delivery receipt
      await job.updateProgress(100);

      this.logger.log(`Completed email-send job ${job.id}`);
    } catch (err) {
      this.logger.error({
        message: 'email-send job failed',
        jobId: job.id,
        type: job.name,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        attemptsMade: job.attemptsMade,
      });
      throw err;
    }
  }
}
