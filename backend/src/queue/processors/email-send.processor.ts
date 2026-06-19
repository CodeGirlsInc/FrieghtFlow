import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('email-send')
export class EmailSendProcessor {
  private readonly logger = new Logger(EmailSendProcessor.name);

  @Process({
    concurrency: 2,
  })
  async handleEmailSend(job: Job) {
    this.logger.log(`Processing email-send job ${job.id}`);
    
    try {
      await job.updateProgress(25);
      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 300));
      await job.updateProgress(50);
      
      await new Promise((resolve) => setTimeout(resolve, 300));
      await job.updateProgress(75);
      
      await job.updateProgress(100);
      this.logger.log(`Job ${job.id} completed`);
    } catch (error) {
      this.logger.error(
        `Job ${job.id} failed`,
        error instanceof Error ? error.stack : String(error),
      );

      const maxRetries = job.opts.attempts || 3;
      if (job.attemptsMade >= maxRetries) {
        this.logger.error(`Job ${job.id} permanently failed. Logged to system.`);
        // Could update an EmailLog entity status to FAILED here if it existed
      }
      throw error;
    }
  }
}
