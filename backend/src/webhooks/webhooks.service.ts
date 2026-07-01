import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShipmentEvent } from '../shipments/events/shipment.events';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { Webhook } from './entities/webhook.entity';

type WebhookPayload = {
  event: 'shipment.status_changed';
  occurredAt: string;
  actorId: string;
  reason?: string;
  shipment: {
    id: string;
    trackingNumber: string;
    shipperId: string;
    carrierId: string | null;
    origin: string;
    destination: string;
    status: string;
  };
};

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepo: Repository<Webhook>,
  ) {}

  async create(userId: string, dto: CreateWebhookDto): Promise<Webhook> {
    const webhook = this.webhookRepo.create({
      userId,
      url: dto.url,
      secret: dto.secret,
    });

    return this.webhookRepo.save(webhook);
  }

  async findAllForUser(userId: string): Promise<Webhook[]> {
    return this.webhookRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(userId: string, webhookId: string): Promise<void> {
    const webhook = await this.webhookRepo.findOne({
      where: { id: webhookId },
    });

    if (!webhook) {
      throw new NotFoundException(`Webhook ${webhookId} not found`);
    }

    if (webhook.userId !== userId) {
      throw new ForbiddenException('You can only delete your own webhooks');
    }

    await this.webhookRepo.delete({ id: webhookId });
  }

  async deliverShipmentStatusChange(event: ShipmentEvent): Promise<void> {
    const webhooks = await this.findAllForUser(event.shipment.shipperId);

    if (webhooks.length === 0) {
      return;
    }

    const payload = this.buildShipmentStatusPayload(event);
    await Promise.allSettled(
      webhooks.map((webhook) => this.deliverWebhookWithRetry(webhook, payload)),
    );
  }

  signPayload(payload: string, secret: string, timestamp: string): string {
    return createHmac('sha256', secret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');
  }

  private buildShipmentStatusPayload(event: ShipmentEvent): WebhookPayload {
    return {
      event: 'shipment.status_changed',
      occurredAt: new Date().toISOString(),
      actorId: event.actorId,
      reason: event.reason,
      shipment: {
        id: event.shipment.id,
        trackingNumber: event.shipment.trackingNumber,
        shipperId: event.shipment.shipperId,
        carrierId: event.shipment.carrierId,
        origin: event.shipment.origin,
        destination: event.shipment.destination,
        status: event.shipment.status,
      },
    };
  }

  private async deliverWebhookWithRetry(
    webhook: Webhook,
    payload: WebhookPayload,
  ): Promise<void> {
    const payloadJson = JSON.stringify(payload);
    const timestamp = new Date().toISOString();
    const signature = this.signPayload(payloadJson, webhook.secret, timestamp);

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        await this.postWebhook(webhook.url, payloadJson, timestamp, signature);
        return;
      } catch (error) {
        if (attempt === 3) {
          const message =
            error instanceof Error
              ? error.message
              : 'Unknown webhook delivery error';
          this.logger.warn(
            `Failed to deliver webhook ${webhook.id} after 3 attempts: ${message}`,
          );
          return;
        }

        await this.delay(250 * 2 ** (attempt - 1));
      }
    }
  }

  private async postWebhook(
    url: string,
    payload: string,
    timestamp: string,
    signature: string,
  ): Promise<void> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-freightflow-event': 'shipment.status_changed',
        'x-freightflow-timestamp': timestamp,
        'x-freightflow-signature': signature,
      },
      body: payload,
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Webhook delivery failed with status ${response.status}`);
    }
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
