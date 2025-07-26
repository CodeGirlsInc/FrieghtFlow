import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { WebhookEvent } from './entities/webhook-event.entity';
import { WebhookSourceRegistry } from './webhook-source.registry';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookEvent]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookSourceRegistry],
  exports: [WebhooksService, WebhookSourceRegistry],
})
export class WebhooksModule {}
