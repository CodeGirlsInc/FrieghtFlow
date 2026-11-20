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
    onChainShipmentId: null,
    insurancePremium: null,
    status: ShipmentStatus.COMPLETED,
    notes: null,
    cancellationFee: null,
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
  let shipmentRepo: {
    createQueryBuilder: jest.Mock;
  };

  beforeEach(async () => {
    shipmentRepo = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarriersService,
        { provide: getRepositoryToken(Shipment), useValue: shipmentRepo },
      ],
    }).compile();

    service = module.get<CarriersService>(CarriersService);
  });

  const mockAggregateResults = (...results: Array<{ count?: string; total?: string | null }>) => {
    shipmentRepo.createQueryBuilder.mockImplementation(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue(results.shift() ?? { count: '0' }),
    }));
  };

  it('calculates on-time rate correctly', async () => {
    mockAggregateResults(
      { count: '2' },
      { count: '2' },
      { count: '1' },
      { count: '2' },
      { count: '1' },
      { total: '10000' },
    );

    const metrics = await service.getMyMetrics('carrier-1');

    expect(metrics.onTimeRate).toBe(0.5);
    expect(metrics.totalCompleted).toBe(2);
    expect(metrics.totalEarnings).toBe(10000);
  });

  it('returns zero rates when no shipments', async () => {
    mockAggregateResults(
      { count: '0' },
      { count: '0' },
      { count: '0' },
      { count: '0' },
      { count: '0' },
      { total: '0' },
    );

    const metrics = await service.getMyMetrics('carrier-1');

    expect(metrics.onTimeRate).toBe(0);
    expect(metrics.cancellationRate).toBe(0);
    expect(metrics.totalEarnings).toBe(0);
  });

  it('calculates cancellation rate', async () => {
    mockAggregateResults(
      { count: '2' },
      { count: '1' },
      { count: '1' },
      { count: '2' },
      { count: '1' },
      { total: '5000' },
    );

    const metrics = await service.getMyMetrics('carrier-1');

    expect(metrics.cancellationRate).toBe(0.5);
  });
});
