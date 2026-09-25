import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UserRole } from '../common/enums/role.enum';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { ShipmentEvent } from '../shipments/events/shipment.events';
import { Shipment } from '../shipments/entities/shipment.entity';
import { User } from '../users/entities/user.entity';
import { Webhook } from './entities/webhook.entity';
import {
  WebhooksService,
  MAX_ACTIVE_WEBHOOKS_PER_USER,
} from './webhooks.service';

function makeUser(): User {
  return {
    id: 'shipper-1',
    email: 'shipper@example.com',
    passwordHash: 'hash',
    firstName: 'Jane',
    lastName: 'Doe',
    role: UserRole.SHIPPER,
    isEmailVerified: true,
    isActive: true,
    walletAddress: null,
    refreshToken: null,
    verificationToken: null,
    verificationTokenExpiry: null,
    resetPasswordToken: null,
    resetPasswordExpiry: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeShipment(): Shipment {
  return {
    id: 'shipment-1',
    trackingNumber: 'FF-TEST-001',
    shipperId: 'shipper-1',
    shipper: makeUser(),
    carrierId: 'carrier-1',
    carrier: null,
    origin: 'Lagos',
    destination: 'Abuja',
    cargoDescription: 'Electronics',
    weightKg: 100,
    volumeCbm: null,
    price: 5000,
    currency: 'USD',
    cargoCategory: null,
    isInsured: false,
    onChainShipmentId: null,
    insurancePremium: null,
    status: ShipmentStatus.IN_TRANSIT,
    notes: null,
    pickupDate: null,
    estimatedDeliveryDate: null,
    actualDeliveryDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('WebhooksService', () => {
  let service: WebhooksService;
  let webhookRepo: jest.Mocked<Repository<Webhook>>;
  let configService: { get: jest.Mock };
  const originalFetch = global.fetch;

  beforeEach(async () => {
    webhookRepo = {
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<Webhook>>;
    configService = {
      get: jest.fn((_key: string, fallback: unknown) => fallback),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: getRepositoryToken(Webhook), useValue: webhookRepo },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('creates a webhook when the user is below the active limit', async () => {
    webhookRepo.count.mockResolvedValue(MAX_ACTIVE_WEBHOOKS_PER_USER - 1);
    webhookRepo.create.mockImplementation((value) => value as Webhook);
    webhookRepo.save.mockImplementation((value) =>
      Promise.resolve(value as Webhook),
    );

    const result = await service.create('shipper-1', {
      url: 'https://example.com/webhook',
      secret: 'whsec_test',
    });

    expect(webhookRepo.count).toHaveBeenCalledWith({
      where: { userId: 'shipper-1' },
    });
    expect(result).toEqual(
      expect.objectContaining({
        userId: 'shipper-1',
        url: 'https://example.com/webhook',
      }),
    );
  });

  it('returns a conflict without saving when the active limit is reached', async () => {
    webhookRepo.count.mockResolvedValue(MAX_ACTIVE_WEBHOOKS_PER_USER);

    await expect(
      service.create('shipper-1', {
        url: 'https://example.com/webhook',
        secret: 'whsec_test',
      }),
    ).rejects.toThrow(ConflictException);

    expect(webhookRepo.save).not.toHaveBeenCalled();
  });

  it('uses the validated configured limit for creation', async () => {
    configService.get.mockReturnValue(2);
    webhookRepo.count.mockResolvedValue(2);

    await expect(
      service.create('shipper-1', {
        url: 'https://example.com/webhook',
        secret: 'whsec_test',
      }),
    ).rejects.toThrow(ConflictException);

    expect(configService.get).toHaveBeenCalledWith(
      'WEBHOOK_MAX_PER_USER',
      MAX_ACTIVE_WEBHOOKS_PER_USER,
    );
    expect(webhookRepo.save).not.toHaveBeenCalled();
  });

  it('frees a slot when an existing webhook is removed', async () => {
    let activeCount = MAX_ACTIVE_WEBHOOKS_PER_USER;
    webhookRepo.count.mockImplementation(() => Promise.resolve(activeCount));
    webhookRepo.findOne.mockResolvedValue({
      id: 'webhook-to-remove',
      userId: 'shipper-1',
    } as Webhook);
    webhookRepo.delete.mockImplementation(() => {
      activeCount -= 1;
      return Promise.resolve({ affected: 1, raw: [] } as DeleteResult);
    });
    webhookRepo.create.mockImplementation((value) => value as Webhook);
    webhookRepo.save.mockImplementation((value) => {
      activeCount += 1;
      return Promise.resolve(value as Webhook);
    });

    await service.remove('shipper-1', 'webhook-to-remove');
    await service.create('shipper-1', {
      url: 'https://example.com/replacement',
      secret: 'whsec_test',
    });

    expect(webhookRepo.delete).toHaveBeenCalledWith({
      id: 'webhook-to-remove',
    });
    expect(webhookRepo.save).toHaveBeenCalledTimes(1);
  });

  it('uses a repository transaction and advisory lock when available', async () => {
    const transactionManager = {
      query: jest.fn().mockResolvedValue([]),
      getRepository: jest.fn().mockReturnValue(webhookRepo),
    };
    const manager = {
      query: jest.fn(),
      transaction: jest.fn(
        (callback: (tx: typeof transactionManager) => Promise<unknown>) =>
          callback(transactionManager),
      ),
    };
    Object.defineProperty(webhookRepo, 'manager', {
      configurable: true,
      value: manager,
    });
    webhookRepo.count.mockResolvedValue(0);
    webhookRepo.create.mockImplementation((value) => value as Webhook);
    webhookRepo.save.mockImplementation((value) =>
      Promise.resolve(value as Webhook),
    );

    await service.create('shipper-1', {
      url: 'https://example.com/webhook',
      secret: 'whsec_test',
    });

    expect(manager.transaction).toHaveBeenCalledTimes(1);
    expect(transactionManager.query).toHaveBeenCalledWith(
      'SELECT pg_advisory_xact_lock(hashtext($1))',
      ['shipper-1'],
    );
    expect(transactionManager.getRepository).toHaveBeenCalledWith(Webhook);
  });

  it('serializes concurrent creates for one user and never exceeds the cap', async () => {
    let activeCount = 0;
    webhookRepo.count.mockImplementation(() => Promise.resolve(activeCount));
    webhookRepo.create.mockImplementation((value) => value as Webhook);
    webhookRepo.save.mockImplementation((value) => {
      activeCount += 1;
      return Promise.resolve(value as Webhook);
    });

    const results = await Promise.allSettled(
      Array.from({ length: MAX_ACTIVE_WEBHOOKS_PER_USER + 3 }, () =>
        service.create('shipper-1', {
          url: 'https://example.com/webhook',
          secret: 'whsec_test',
        }),
      ),
    );

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(MAX_ACTIVE_WEBHOOKS_PER_USER);
    expect(
      results.filter(
        (result) =>
          result.status === 'rejected' &&
          result.reason instanceof ConflictException,
      ),
    ).toHaveLength(3);
    expect(webhookRepo.save).toHaveBeenCalledTimes(
      MAX_ACTIVE_WEBHOOKS_PER_USER,
    );
    expect(activeCount).toBe(MAX_ACTIVE_WEBHOOKS_PER_USER);
  });

  it('creates a deterministic HMAC signature for webhook verification', () => {
    const payload = '{"event":"shipment.status_changed"}';
    const timestamp = '2026-04-24T00:00:00.000Z';

    expect(service.signPayload(payload, 'test-secret', timestamp)).toBe(
      'a0a1511d3888962d34b87a2e2988bcffedd46c15d92801d8d990270dc16669bb',
    );
  });

  it('retries failed webhook deliveries up to three times with exponential backoff', async () => {
    const delaySpy = jest
      .spyOn(service as any, 'delay')
      .mockResolvedValue(undefined);
    webhookRepo.find.mockResolvedValue([
      {
        id: 'webhook-1',
        userId: 'shipper-1',
        url: 'https://example.com/webhook',
        secret: 'whsec_test',
        createdAt: new Date(),
      },
    ] as Webhook[]);

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: false, status: 502 })
      .mockResolvedValueOnce({ ok: true, status: 200 });

    await service.deliverShipmentStatusChange(
      new ShipmentEvent(makeShipment(), 'carrier-1'),
    );

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(delaySpy).toHaveBeenNthCalledWith(1, 250);
    expect(delaySpy).toHaveBeenNthCalledWith(2, 500);
  });

  it('bounds delivery for legacy users with more webhooks than the cap', async () => {
    configService.get.mockReturnValue(2);
    webhookRepo.find.mockResolvedValue(
      Array.from({ length: 5 }, (_, index) => ({
        id: `webhook-${index}`,
        userId: 'shipper-1',
        url: `https://example.com/webhook-${index}`,
        secret: 'whsec_test',
        createdAt: new Date(),
      })) as Webhook[],
    );
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200 });

    await service.deliverShipmentStatusChange(
      new ShipmentEvent(makeShipment(), 'carrier-1'),
    );

    expect(webhookRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'shipper-1' },
        take: 2,
      }),
    );
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'https://example.com/webhook-0',
      expect.anything(),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://example.com/webhook-1',
      expect.anything(),
    );
  });

  it('sends signed shipment status payloads to the shipper webhooks only', async () => {
    webhookRepo.find.mockResolvedValue([
      {
        id: 'webhook-1',
        userId: 'shipper-1',
        url: 'https://example.com/webhook',
        secret: 'whsec_test',
        createdAt: new Date(),
      },
    ] as Webhook[]);
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200 });

    const shipment = makeShipment();
    await service.deliverShipmentStatusChange(
      new ShipmentEvent(shipment, 'carrier-1'),
    );

    expect(webhookRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: shipment.shipperId } }),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/webhook',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-freightflow-event': 'shipment.status_changed',
          'x-freightflow-signature': expect.any(String),
        }),
      }),
    );
  });
});
