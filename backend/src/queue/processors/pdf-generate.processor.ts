import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('pdf-generate')
export class PdfGenerateProcessor {
  private readonly logger = new Logger(PdfGenerateProcessor.name);

  @Process({
    concurrency: 2,
  })
  async handlePdfGenerate(job: Job) {
    this.logger.log(`Processing pdf-generate job ${job.id}`);
    
    try {
      await job.updateProgress(25);
      // Simulate PDF generation
      await new Promise((resolve) => setTimeout(resolve, 500));
      await job.updateProgress(50);
      
      await new Promise((resolve) => setTimeout(resolve, 500));
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
        // Update Document status if applicable
      }
      throw error;
    }
  }
}
