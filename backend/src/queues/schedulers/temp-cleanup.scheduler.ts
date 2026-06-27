import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TempCleanupScheduler {
  private readonly logger = new Logger(TempCleanupScheduler.name);

  constructor(@InjectQueue('pdf-generate') private readonly pdfQueue: Queue) {}

  @Cron('0 3 * * *')
  async handleTempCleanup(): Promise<void> {
    this.logger.log('Running temp file cleanup at 03:00');
    await this.pdfQueue.add('generate-pdf', {
      type: 'cleanup',
      triggeredAt: new Date().toISOString(),
    });
  }
}
