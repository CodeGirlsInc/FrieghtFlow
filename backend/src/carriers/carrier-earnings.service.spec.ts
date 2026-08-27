import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CarrierEarningsService } from './carrier-earnings.service';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';

function makeShipment(
  overrides: Partial<Shipment> = {},
): Shipment {
  return {
    id: 'shipment-1',
    trackingNumber: 'FF-001',
    shipperId: 'shipper-1',
    shipper: null as never,
    carrierId: 'carrier-1',
    carrier: null as never,
    origin: 'Lagos',
    destination: 'Abuja',
    cargoDescription: 'Electronics',
    cargoCategory: null,
    weightKg: 100,
    volumeCbm: null,
    price: 5000,
    currency: 'USD',
    isInsured: false,
    onChainShipmentId: null,
    insurancePremium: null,
    status: ShipmentStatus.COMPLETED,
    notes: null,
    pickupDate: null,
    estimatedDeliveryDate: null,
    actualDeliveryDate: new Date('2026-08-15T12:00:00.000Z'),
    createdAt: new Date('2026-08-15T12:00:00.000Z'),
    updatedAt: new Date('2026-08-15T12:00:00.000Z'),
    ...overrides,
  };
}

describe('CarrierEarningsService', () => {
  let service: CarrierEarningsService;
  let shipmentRepo: { find: jest.Mock };

  beforeEach(async () => {
    shipmentRepo = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarrierEarningsService,
        { provide: getRepositoryToken(Shipment), useValue: shipmentRepo },
      ],
    }).compile();

    service = module.get(CarrierEarningsService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('aggregates lifetime and monthly earnings', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-20T12:00:00.000Z'));
    shipmentRepo.find.mockResolvedValue([
      makeShipment({ id: 'ship-1', price: 5000, actualDeliveryDate: new Date('2026-08-15T12:00:00.000Z') }),
      makeShipment({ id: 'ship-2', price: 2000, actualDeliveryDate: new Date('2026-07-10T12:00:00.000Z') }),
      makeShipment({ id: 'ship-3', price: 999, actualDeliveryDate: null }),
    ]);

    const summary = await service.getEarningsSummary('carrier-1');

    expect(shipmentRepo.find).toHaveBeenCalledWith({
      where: { carrierId: 'carrier-1', status: ShipmentStatus.COMPLETED },
      select: ['id', 'price', 'actualDeliveryDate'],
    });
    expect(summary.lifetimeEarnings).toBe(7999);
    expect(summary.currentMonthEarnings).toBe(5000);
    expect(summary.monthlyBreakdown).toHaveLength(12);
    expect(
      summary.monthlyBreakdown.find((item) => item.month === '2026-08'),
    ).toMatchObject({ earnings: 5000, completedShipments: 1 });
    expect(
      summary.monthlyBreakdown.find((item) => item.month === '2026-07'),
    ).toMatchObject({ earnings: 2000, completedShipments: 1 });
  });
});
