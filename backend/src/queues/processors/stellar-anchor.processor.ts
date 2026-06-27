import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('stellar-anchor')
export class StellarAnchorProcessor extends WorkerHost {
  private readonly logger = new Logger(StellarAnchorProcessor.name);

  process(job: Job): Promise<void> {
    this.logger.log(`Processing stellar-anchor job ${job.id} (${job.name})`);
    switch (job.name) {
      case 'anchor-payment':
        this.handleAnchorPayment(job.data as Record<string, unknown>);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
    return Promise.resolve();
  }

  private handleAnchorPayment(data: Record<string, unknown>): void {
    this.logger.log(`Anchor payment job data: ${JSON.stringify(data)}`);
  }
}
