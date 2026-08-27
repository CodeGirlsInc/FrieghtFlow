import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { UserRole } from '../common/enums/role.enum';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';

describe('AdminService', () => {
  let service: AdminService;
  let userRepo: { findAndCount: jest.Mock; findOne: jest.Mock; update: jest.Mock; count: jest.Mock; createQueryBuilder: jest.Mock };
  let shipmentRepo: { createQueryBuilder: jest.Mock; count: jest.Mock };

  beforeEach(async () => {
    userRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    shipmentRepo = {
      createQueryBuilder: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Shipment), useValue: shipmentRepo },
      ],
    }).compile();

    service = module.get(AdminService);
  });

  it('returns platform stats', async () => {
    userRepo.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2);
    userRepo.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockResolvedValue([{ role: UserRole.ADMIN, count: '1' }]),
    });
    shipmentRepo.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(1);
    shipmentRepo.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockResolvedValue([{ status: ShipmentStatus.COMPLETED, count: '4' }]),
      getRawOne: jest.fn().mockResolvedValue({ total: '12000' }),
    });

    const stats = await service.getStats();

    expect(stats.users.total).toBe(3);
    expect(stats.users.byRole[UserRole.ADMIN]).toBe(1);
    expect(stats.shipments.total).toBe(5);
    expect(stats.revenue.totalCompleted).toBe(12000);
  });

  it('prevents admins from changing their own role', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'admin-1' } as User);

    await expect(
      service.changeUserRole('admin-1', UserRole.CARRIER, 'admin-1'),
    ).rejects.toThrow();
  });
});
