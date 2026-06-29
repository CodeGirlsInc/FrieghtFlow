import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_PDF_GENERATE } from '../queue.constants';

@Processor(QUEUE_PDF_GENERATE)
export class PdfGenerateProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfGenerateProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(
      `Processing pdf-generate job ${job.id} (type: ${job.name})`,
    );

    try {
      await job.updateProgress(25);
      // Fetch shipment/invoice data — consumed by BE-08
      await job.updateProgress(50);
      // Render PDF template
      await job.updateProgress(75);
      // Upload to storage and store Document record
      await job.updateProgress(100);

      this.logger.log(`Completed pdf-generate job ${job.id}`);
    } catch (err) {
      this.logger.error({
        message: 'pdf-generate job failed',
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
