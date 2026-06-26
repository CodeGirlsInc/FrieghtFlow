import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/role.enum';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { ShipmentEvent } from '../shipments/events/shipment.events';
import { Shipment } from '../shipments/entities/shipment.entity';
import { User } from '../users/entities/user.entity';
import { Webhook } from './entities/webhook.entity';
import { WebhooksService } from './webhooks.service';

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
    isTwoFactorEnabled: false,
    twoFactorSecret: null,
    recoveryCodes: [],
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
    isRFQ: false,
    isInsured: false,
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
  const originalFetch = global.fetch;

  beforeEach(async () => {
    webhookRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<Webhook>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: getRepositoryToken(Webhook), useValue: webhookRepo },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.fetch = originalFetch;
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
      expect.objectContaining({
        where: expect.objectContaining({ userId: shipment.shipperId }),
      }),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/webhook',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-freightflow-event': 'shipment.status_changed',
          'X-FreightFlow-Signature': expect.any(String),
        }),
      }),
    );
  });
});
