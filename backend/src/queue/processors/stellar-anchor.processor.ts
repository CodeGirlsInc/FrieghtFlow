import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';

@Processor('stellar-anchor')
export class StellarAnchorProcessor {
  private readonly logger = new Logger(StellarAnchorProcessor.name);

  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
  ) {}

  @Process({
    concurrency: 1,
  })
  async handleStellarTransaction(job: Job) {
    this.logger.log(`Processing stellar-anchor job ${job.id}`);
    
    try {
      await job.updateProgress(25);
      // Simulate work
      await new Promise((resolve) => setTimeout(resolve, 500));
      await job.updateProgress(50);
      
      // Attempt some stellar logic...
      
      await job.updateProgress(75);
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      await job.updateProgress(100);
      this.logger.log(`Job ${job.id} completed`);
    } catch (error) {
      this.logger.error(
        `Job ${job.id} failed`,
        error instanceof Error ? error.stack : String(error),
      );

      // Handle permanent failure logic using job.attemptsMade
      const maxRetries = job.opts.attempts || 3;
      if (job.attemptsMade >= maxRetries) {
        this.logger.error(`Job ${job.id} permanently failed. Updating shipment status.`);
        const shipmentId = job.data?.shipmentId;
        if (shipmentId) {
          await this.shipmentRepository.update(shipmentId, {
            status: ShipmentStatus.FAILED,
          });
        }
      }
      throw error;
    }
  }
}
