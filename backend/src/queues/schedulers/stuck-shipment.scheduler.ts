import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class StuckShipmentScheduler {
  private readonly logger = new Logger(StuckShipmentScheduler.name);

  constructor(
    @InjectQueue('stellar-anchor') private readonly stellarQueue: Queue,
  ) {}

  @Cron('0 2 * * *')
  async handleStuckShipments(): Promise<void> {
    this.logger.log('Running stuck shipment check at 02:00');
    await this.stellarQueue.add('anchor-payment', {
      type: 'stuck-check',
      triggeredAt: new Date().toISOString(),
    });
  }
}
