import { Test, TestingModule } from '@nestjs/testing';
import { AdminStatsService } from './admin-stats.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { Repository } from 'typeorm';

describe('AdminStatsService', () => {
  let service: AdminStatsService;
  let userRepository: Repository<User>;
  let shipmentRepository: Repository<Shipment>;

  const mockUserRepository = {
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    })),
  };

  const mockShipmentRepository = {
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
      getRawOne: jest.fn().mockResolvedValue({ total: 0 }),
      getCount: jest.fn().mockResolvedValue(0),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminStatsService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Shipment),
          useValue: mockShipmentRepository,
        },
      ],
    }).compile();

    service = module.get<AdminStatsService>(AdminStatsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    shipmentRepository = module.get<Repository<Shipment>>(
      getRepositoryToken(Shipment),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should call the query builders with the correct parameters', async () => {
      await service.getStats();
      expect(userRepository.createQueryBuilder).toHaveBeenCalled();
      expect(shipmentRepository.createQueryBuilder).toHaveBeenCalledTimes(4);
    });
  });
});
