import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('pdf-generate')
export class PdfGenerateProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfGenerateProcessor.name);

  process(job: Job): Promise<void> {
    this.logger.log(`Processing pdf-generate job ${job.id} (${job.name})`);
    switch (job.name) {
      case 'generate-pdf':
        this.handleGeneratePdf(job.data as Record<string, unknown>);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
    return Promise.resolve();
  }

  private handleGeneratePdf(data: Record<string, unknown>): void {
    this.logger.log(
      `Generating PDF for shipment: ${String(data['shipmentId'])}`,
    );
  }
}
