import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

/**
 * A webhook is active for its entire lifetime; remove() physically deletes
 * it. The default cap bounds delivery fan-out while WEBHOOK_MAX_PER_USER can
 * be tuned for a deployment (within the validated safety range).
 */
export const DEFAULT_MAX_ACTIVE_WEBHOOKS_PER_USER = 10;
export const MAX_ACTIVE_WEBHOOKS_PER_USER =
  DEFAULT_MAX_ACTIVE_WEBHOOKS_PER_USER; // backwards-compatible default alias
export const WEBHOOK_MAX_PER_USER_CONFIG_KEY = 'WEBHOOK_MAX_PER_USER';
const MAX_CONFIGURED_WEBHOOKS_PER_USER = 100;

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  /**
   * The database advisory lock below protects multiple application
   * instances.  This small in-process queue also makes the invariant hold for
   * concurrent requests handled by one process and keeps the unit-test
   * repository fallback deterministic.
   */
  private readonly userCreateLocks = new Map<string, Promise<void>>();

  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepo: Repository<Webhook>,
    @Optional()
    private readonly configService?: ConfigService,
  ) {}

  private get maxActiveWebhooksPerUser(): number {
    const configured = this.configService?.get<unknown>(
      WEBHOOK_MAX_PER_USER_CONFIG_KEY,
      DEFAULT_MAX_ACTIVE_WEBHOOKS_PER_USER,
    );
    const numeric =
      typeof configured === 'number' ? configured : Number(configured);

    return Number.isInteger(numeric) &&
      numeric >= 1 &&
      numeric <= MAX_CONFIGURED_WEBHOOKS_PER_USER
      ? numeric
      : DEFAULT_MAX_ACTIVE_WEBHOOKS_PER_USER;
  }

  async create(userId: string, dto: CreateWebhookDto): Promise<Webhook> {
    return this.withUserCreateLock(userId, () =>
      this.createWithinLimit(userId, dto),
    );
  }

  private async withUserCreateLock<T>(
    userId: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const previous = this.userCreateLocks.get(userId) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.userCreateLocks.set(userId, current);

    await previous;
    try {
      return await operation();
    } finally {
      release();
      if (this.userCreateLocks.get(userId) === current) {
        this.userCreateLocks.delete(userId);
      }
    }
  }

  private async createWithinLimit(
    userId: string,
    dto: CreateWebhookDto,
  ): Promise<Webhook> {
    const limit = this.maxActiveWebhooksPerUser;
    const manager = this.webhookRepo.manager;

    // TypeORM repositories expose an EntityManager in the application.  The
    // shape check also keeps this service straightforward to unit-test with a
    // lightweight repository double.
    if (
      manager &&
      typeof manager.transaction === 'function' &&
      typeof manager.query === 'function'
    ) {
      return manager.transaction(async (transactionManager) => {
        if (
          typeof transactionManager?.query !== 'function' ||
          typeof transactionManager?.getRepository !== 'function'
        ) {
          // This branch is only for incomplete repository doubles; a real
          // TypeORM EntityManager always exposes both methods.
          return this.createInRepository(this.webhookRepo, userId, dto, limit);
        }

        // Serialize count+insert for this user across all app instances.  A
        // count followed by an ordinary insert would otherwise allow two
        // concurrent requests to both observe count=9 and create 11 rows.
        await transactionManager.query(
          'SELECT pg_advisory_xact_lock(hashtext($1))',
          [userId],
        );

        const transactionRepo = transactionManager.getRepository(Webhook);
        return this.createInRepository(transactionRepo, userId, dto, limit);
      });
    }

    return this.createInRepository(this.webhookRepo, userId, dto, limit);
  }

  private async createInRepository(
    repository: Repository<Webhook>,
    userId: string,
    dto: CreateWebhookDto,
    limit: number,
  ): Promise<Webhook> {
    const activeCount = await this.countActiveWebhooks(repository, userId);
    if (activeCount >= limit) {
      throw new ConflictException(
        `Webhook limit reached: a user can have at most ${limit} active webhooks`,
      );
    }

    // There is currently no disabled/status field: persisted rows are active
    // until remove() deletes them, so the per-user count is the active count.
    const webhook = repository.create({
      userId,
      url: dto.url,
      secret: dto.secret,
    });

    return repository.save(webhook);
  }

  private async countActiveWebhooks(
    repository: Repository<Webhook>,
    userId: string,
  ): Promise<number> {
    if (typeof repository.count === 'function') {
      const count = await repository.count({ where: { userId } });
      if (typeof count === 'number') return count;
    }

    // The fallback is useful for small repository doubles and keeps the
    // production path count-based (rather than loading every webhook).
    const existing = await repository.find({ where: { userId } });
    return Array.isArray(existing) ? existing.length : 0;
  }

  private async findForDelivery(
    userId: string,
    limit: number,
  ): Promise<Webhook[]> {
    return this.webhookRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
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
    const limit = this.maxActiveWebhooksPerUser;
    // Legacy rows may exceed the current configured cap. The query is bounded
    // for normal database execution, and the slice is a defensive fallback for
    // repository implementations that ignore `take`.
    const allWebhooks = await this.findForDelivery(
      event.shipment.shipperId,
      limit,
    );
    const webhooks = allWebhooks.slice(0, limit);

    if (allWebhooks.length > webhooks.length) {
      this.logger.warn(
        `Limiting webhook delivery for user ${event.shipment.shipperId} to ${limit} of ${allWebhooks.length} active webhooks`,
      );
    }

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
