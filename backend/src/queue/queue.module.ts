import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  QUEUE_EMAIL_SEND,
  QUEUE_PDF_GENERATE,
  QUEUE_STELLAR_ANCHOR,
} from './queue.constants';
import { StellarAnchorProcessor } from './processors/stellar-anchor.processor';
import { EmailSendProcessor } from './processors/email-send.processor';
import { PdfGenerateProcessor } from './processors/pdf-generate.processor';

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 1000 },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 200 },
};

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_STELLAR_ANCHOR, defaultJobOptions },
      { name: QUEUE_EMAIL_SEND, defaultJobOptions },
      { name: QUEUE_PDF_GENERATE, defaultJobOptions },
    ),
  ],
  providers: [StellarAnchorProcessor, EmailSendProcessor, PdfGenerateProcessor],
  exports: [BullModule],
})
export class QueueModule {}
