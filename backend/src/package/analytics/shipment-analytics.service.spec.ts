import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShipmentAnalyticsService } from './shipment-analytics.service';
import { Shipment } from '../../shipments/entities/shipment.entity';

function makeQb(
  statusRows: object[],
  weeklyRows: object[],
  durationRow: object,
  routeRows: object[],
) {
  let cloneCallCount = 0;
  const results = [statusRows, weeklyRows, [durationRow], routeRows];

  const makeClone = () => {
    const idx = cloneCallCount++;
    const clone: Record<string, jest.Mock> = {};
    clone.select = jest.fn().mockReturnValue(clone);
    clone.addSelect = jest.fn().mockReturnValue(clone);
    clone.andWhere = jest.fn().mockReturnValue(clone);
    clone.groupBy = jest.fn().mockReturnValue(clone);
    clone.orderBy = jest.fn().mockReturnValue(clone);
    clone.limit = jest.fn().mockReturnValue(clone);
    clone.getRawMany = jest.fn().mockResolvedValue(results[idx] ?? []);
    clone.getRawOne = jest.fn().mockResolvedValue(durationRow);
    return clone;
  };

  const qb: Record<string, jest.Mock> = {};
  qb.select = jest.fn().mockReturnValue(qb);
  qb.addSelect = jest.fn().mockReturnValue(qb);
  qb.andWhere = jest.fn().mockReturnValue(qb);
  qb.groupBy = jest.fn().mockReturnValue(qb);
  qb.orderBy = jest.fn().mockReturnValue(qb);
  qb.limit = jest.fn().mockReturnValue(qb);
  qb.clone = jest.fn().mockImplementation(makeClone);
  qb.getRawMany = jest.fn().mockResolvedValue(statusRows);
  qb.getRawOne = jest.fn().mockResolvedValue(durationRow);
  return qb;
}

describe('ShipmentAnalyticsService', () => {
  let service: ShipmentAnalyticsService;
  let mockRepo: { createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    const qb = makeQb(
      [
        { status: 'completed', count: '10' },
        { status: 'pending', count: '5' },
      ],
      [{ week: '2024-01-01', count: '4' }],
      { avg_hours: '48.5' },
      [{ origin: 'Lagos', destination: 'Abuja', count: '8' }],
    );
    mockRepo = { createQueryBuilder: jest.fn().mockReturnValue(qb) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentAnalyticsService,
        { provide: getRepositoryToken(Shipment), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ShipmentAnalyticsService>(ShipmentAnalyticsService);
  });

  it('returns statusCounts, weeklyVolume, avgDeliveryDurationHours, topRoutes', async () => {
    const result = await service.getAnalytics({});
    expect(result).toHaveProperty('statusCounts');
    expect(result).toHaveProperty('weeklyVolume');
    expect(result).toHaveProperty('avgDeliveryDurationHours');
    expect(result).toHaveProperty('topRoutes');
  });

  it('converts count strings to numbers', async () => {
    const result = await service.getAnalytics({});
    expect(typeof result.statusCounts[0].count).toBe('number');
  });

  it('applies startDate and endDate filters when provided', async () => {
    await service.getAnalytics({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
    const qb = mockRepo.createQueryBuilder('s') as { andWhere: jest.Mock };
    expect(qb.andWhere).toHaveBeenCalledWith('s.created_at >= :startDate', {
      startDate: '2024-01-01',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('s.created_at <= :endDate', {
      endDate: '2024-12-31',
    });
  });

  it('returns null avgDeliveryDurationHours when no rows', async () => {
    const qb = makeQb([], [], { avg_hours: null }, []);
    mockRepo.createQueryBuilder.mockReturnValue(qb);
    const result = await service.getAnalytics({});
    expect(result.avgDeliveryDurationHours).toBeNull();
  });
});
