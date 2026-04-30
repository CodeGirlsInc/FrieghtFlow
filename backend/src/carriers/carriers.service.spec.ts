import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CarriersService } from './carriers.service';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { User } from '../users/entities/user.entity';

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 'ship-1',
    trackingNumber: 'FF-001',
    shipperId: 'shipper-1',
    shipper: {} as User,
    carrierId: 'carrier-1',
    carrier: {} as User,
    origin: 'Lagos',
    destination: 'Abuja',
    cargoDescription: 'Goods',
    weightKg: 100,
    volumeCbm: null,
    price: 5000,
    currency: 'USD',
    cargoCategory: null,
    isInsured: false,
    insurancePremium: null,
    status: ShipmentStatus.COMPLETED,
    notes: null,
    pickupDate: null,
    estimatedDeliveryDate: new Date('2024-01-10'),
    actualDeliveryDate: new Date('2024-01-09'),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('CarriersService.getMyMetrics()', () => {
  let service: CarriersService;
  let shipmentRepo: { find: jest.Mock };

  beforeEach(async () => {
    shipmentRepo = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarriersService,
        { provide: getRepositoryToken(Shipment), useValue: shipmentRepo },
      ],
    }).compile();

    service = module.get<CarriersService>(CarriersService);
  });

  it('calculates on-time rate correctly', async () => {
    shipmentRepo.find.mockResolvedValue([
      makeShipment({
        status: ShipmentStatus.COMPLETED,
        actualDeliveryDate: new Date('2024-01-09'),
        estimatedDeliveryDate: new Date('2024-01-10'),
      }),
      makeShipment({
        id: 'ship-2',
        status: ShipmentStatus.COMPLETED,
        actualDeliveryDate: new Date('2024-01-12'),
        estimatedDeliveryDate: new Date('2024-01-10'),
      }),
    ]);

    const metrics = await service.getMyMetrics('carrier-1');

    expect(metrics.onTimeRate).toBe(0.5);
    expect(metrics.totalCompleted).toBe(2);
    expect(metrics.totalEarnings).toBe(10000);
  });

  it('returns zero rates when no shipments', async () => {
    shipmentRepo.find.mockResolvedValue([]);

    const metrics = await service.getMyMetrics('carrier-1');

    expect(metrics.onTimeRate).toBe(0);
    expect(metrics.cancellationRate).toBe(0);
    expect(metrics.totalEarnings).toBe(0);
  });

  it('calculates cancellation rate', async () => {
    shipmentRepo.find.mockResolvedValue([
      makeShipment({ status: ShipmentStatus.ACCEPTED }),
      makeShipment({ id: 'ship-2', status: ShipmentStatus.CANCELLED }),
    ]);

    const metrics = await service.getMyMetrics('carrier-1');

    expect(metrics.cancellationRate).toBe(0.5);
  });
});
