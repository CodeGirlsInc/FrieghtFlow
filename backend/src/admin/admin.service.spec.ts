
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { CarrierCacheService } from '../cache/carrier-cache.service';
import { UserRole } from '../common/enums/role.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { REQUEST } from '@nestjs/core';

describe('AdminService', () => {
  let service: AdminService;
  let cacheService: CarrierCacheService;
  let userRepository: any;
  let response: any;

  const mockUserRepository = {
    findAndCount: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    store: {
      keys: jest.fn(),
    },
  };

  const mockResponse = {
    header: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        CarrierCacheService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Shipment),
          useValue: {},
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: REQUEST,
          useValue: { res: mockResponse },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    cacheService = module.get<CarrierCacheService>(CarrierCacheService);
    userRepository = module.get(getRepositoryToken(User));
    response = module.get(REQUEST).res;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listUsers', () => {
    it('should return cached data if available for carriers', async () => {
      const query = { role: UserRole.CARRIER, page: 1, limit: 10 };
      const cachedData = { data: [], total: 0, page: 1, limit: 10, totalPages: 1 };
      mockCacheManager.get.mockResolvedValue(cachedData);

      const result = await service.listUsers(query);

      expect(mockCacheManager.get).toHaveBeenCalledWith(`carriers:${JSON.stringify(query)}`);
      expect(response.header).toHaveBeenCalledWith('X-Cache', 'HIT');
      expect(result).toEqual(cachedData);
      expect(userRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('should fetch from DB and cache the result if no cache is available for carriers', async () => {
      const query = { role: UserRole.CARRIER, page: 1, limit: 10 };
      const dbData = { data: [], total: 0, page: 1, limit: 10, totalPages: 1 };
      mockCacheManager.get.mockResolvedValue(null);
      mockUserRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.listUsers(query);

      expect(mockCacheManager.get).toHaveBeenCalledWith(`carriers:${JSON.stringify(query)}`);
      expect(userRepository.findAndCount).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledWith(`carriers:${JSON.stringify(query)}`, dbData);
      expect(response.header).toHaveBeenCalledWith('X-Cache', 'MISS');
      expect(result).toEqual(dbData);
    });

    it('should not use cache for non-carrier roles', async () => {
      const query = { role: UserRole.SHIPPER, page: 1, limit: 10 };
      mockUserRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.listUsers(query);

      expect(mockCacheManager.get).not.toHaveBeenCalled();
      expect(userRepository.findAndCount).toHaveBeenCalled();
      expect(mockCacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate the cache', async () => {
      mockCacheManager.store.keys.mockResolvedValue(['carriers:{}']);
      await cacheService.invalidateCache();
      expect(mockCacheManager.del).toHaveBeenCalledWith('carriers:{}');
    });
  });
});