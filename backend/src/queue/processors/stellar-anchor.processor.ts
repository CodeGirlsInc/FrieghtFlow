import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_STELLAR_ANCHOR } from '../queue.constants';

@Processor(QUEUE_STELLAR_ANCHOR)
export class StellarAnchorProcessor extends WorkerHost {
  private readonly logger = new Logger(StellarAnchorProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(
      `Processing stellar-anchor job ${job.id} (type: ${job.name})`,
    );

    try {
      await job.updateProgress(25);
      // Contract call preparation — consumed by BE-34/BE-35/BE-36
      await job.updateProgress(50);
      // Submit transaction to Soroban
      await job.updateProgress(75);
      // Await confirmation
      await job.updateProgress(100);

      this.logger.log(`Completed stellar-anchor job ${job.id}`);
    } catch (err) {
      this.logger.error({
        message: 'stellar-anchor job failed',
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
