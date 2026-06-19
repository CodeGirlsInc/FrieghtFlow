import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { StellarAnchorProcessor } from './processors/stellar-anchor.processor';
import { EmailSendProcessor } from './processors/email-send.processor';
import { PdfGenerateProcessor } from './processors/pdf-generate.processor';
import { ShipmentsModule } from '../shipments/shipments.module';

@Module({
  imports: [
    ShipmentsModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    BullModule.registerQueue(
      {
        name: 'stellar-anchor',
      },
      {
        name: 'email-send',
      },
      {
        name: 'pdf-generate',
      },
    ),
  ],
  providers: [
    StellarAnchorProcessor,
    EmailSendProcessor,
    PdfGenerateProcessor,
  ],
  exports: [BullModule],
})
export class QueueModule {}
