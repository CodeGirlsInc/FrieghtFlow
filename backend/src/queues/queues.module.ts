import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueuesController } from './queues.controller';
import { QueuesService } from './queues.service';
import { StellarAnchorProcessor } from './processors/stellar-anchor.processor';
import { EmailSendProcessor } from './processors/email-send.processor';
import { PdfGenerateProcessor } from './processors/pdf-generate.processor';
import { StuckShipmentScheduler } from './schedulers/stuck-shipment.scheduler';
import { TempCleanupScheduler } from './schedulers/temp-cleanup.scheduler';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url:
            configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'stellar-anchor' },
      { name: 'email-send' },
      { name: 'pdf-generate' },
    ),
  ],
  controllers: [QueuesController],
  providers: [
    QueuesService,
    StellarAnchorProcessor,
    EmailSendProcessor,
    PdfGenerateProcessor,
    StuckShipmentScheduler,
    TempCleanupScheduler,
  ],
  exports: [BullModule],
})
export class QueuesModule {}
