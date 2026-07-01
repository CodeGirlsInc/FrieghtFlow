import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShipmentsService } from './shipments.service';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatusHistory } from './entities/shipment-status-history.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'admin@example.com',
    passwordHash: '',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
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
    ...overrides,
  };
}

function makeQb(
  byStatusResult: object[],
  revenueResult: object,
  dailyResult: object[],
) {
  let callCount = 0;

  const makeClone = () => {
    const clone: Record<string, jest.Mock> = {};
    clone.select = jest.fn().mockReturnValue(clone);
    clone.addSelect = jest.fn().mockReturnValue(clone);
    clone.andWhere = jest.fn().mockReturnValue(clone);
    clone.groupBy = jest.fn().mockReturnValue(clone);
    clone.orderBy = jest.fn().mockReturnValue(clone);
    clone.getRawMany = jest.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve(callCount === 1 ? byStatusResult : dailyResult);
    });
    clone.getRawOne = jest.fn().mockResolvedValue(revenueResult);
    return clone;
  };

  const qb: Record<string, jest.Mock> = {};
  qb.select = jest.fn().mockReturnValue(qb);
  qb.addSelect = jest.fn().mockReturnValue(qb);
  qb.where = jest.fn().mockReturnValue(qb);
  qb.andWhere = jest.fn().mockReturnValue(qb);
  qb.groupBy = jest.fn().mockReturnValue(qb);
  qb.orderBy = jest.fn().mockReturnValue(qb);
  qb.clone = jest.fn().mockImplementation(makeClone);
  qb.getRawMany = jest.fn().mockResolvedValue(byStatusResult);
  qb.getRawOne = jest.fn().mockResolvedValue(revenueResult);

  return qb;
}

describe('ShipmentsService.getAnalytics()', () => {
  let service: ShipmentsService;
  let shipmentRepo: { createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    const qb = makeQb(
      [
        { status: ShipmentStatus.COMPLETED, count: '5' },
        { status: ShipmentStatus.PENDING, count: '3' },
      ],
      { total: '25000' },
      [{ day: '2024-01-15T00:00:00.000Z', count: '2' }],
    );

    shipmentRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        { provide: getRepositoryToken(Shipment), useValue: shipmentRepo },
        { provide: getRepositoryToken(ShipmentStatusHistory), useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);
  });

  it('returns statusCounts, totalRevenue, and dailyTrends', async () => {
    const admin = makeUser({ role: UserRole.ADMIN });
    const result = await service.getAnalytics(admin, {});

    expect(result).toHaveProperty('statusCounts');
    expect(result).toHaveProperty('totalRevenue');
    expect(result).toHaveProperty('dailyTrends');
  });

  it('scopes query to shipperId for SHIPPER role', async () => {
    const shipper = makeUser({ role: UserRole.SHIPPER, id: 'shipper-1' });
    const qb = shipmentRepo.createQueryBuilder('s') as { where: jest.Mock };
    await service.getAnalytics(shipper, {});
    expect(qb.where).toHaveBeenCalledWith('s.shipper_id = :uid', {
      uid: 'shipper-1',
    });
  });
});
