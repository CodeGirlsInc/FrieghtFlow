import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ShipmentEvent } from '../shipments/events/shipment.events';
import { Shipment } from '../shipments/entities/shipment.entity';
import { User } from '../users/entities/user.entity';

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 'shipment-1',
    trackingNumber: 'FF-001',
    shipperId: 'shipper-1',
    shipper: {
      id: 'shipper-1',
      email: 'shipper@example.com',
      firstName: 'Shipper',
      lastName: 'One',
    } as User,
    carrierId: 'carrier-1',
    carrier: {
      id: 'carrier-1',
      email: 'carrier@example.com',
      firstName: 'Carrier',
      lastName: 'One',
    } as User,
    origin: 'Lagos',
    destination: 'Abuja',
    cargoDescription: 'Electronics',
    weightKg: 100,
    currency: 'USD',
    price: 5000,
    status: 'accepted' as never,
    cargoCategory: null,
    volumeCbm: null,
    isInsured: false,
    onChainShipmentId: null,
    insurancePremium: null,
    notes: null,
    pickupDate: null,
    estimatedDeliveryDate: null,
    actualDeliveryDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mailer: { sendMail: jest.Mock };

  beforeEach(async () => {
    mailer = { sendMail: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: MailerService, useValue: mailer },
      ],
    }).compile();

    service = module.get(NotificationsService);
  });

  it('sends acceptance emails to both parties', async () => {
    const evt = new ShipmentEvent(makeShipment(), 'actor-1');

    await service.onShipmentAccepted(evt);

    expect(mailer.sendMail).toHaveBeenCalledTimes(2);
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'shipper@example.com',
      }),
    );
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'carrier@example.com',
      }),
    );
  });

  it('skips notifications when shipment parties are missing', async () => {
    const evt = new ShipmentEvent(
      makeShipment({ shipper: null as never, carrier: null as never }),
      'actor-1',
    );

    await service.onShipmentAccepted(evt);

    expect(mailer.sendMail).not.toHaveBeenCalled();
  });
});
