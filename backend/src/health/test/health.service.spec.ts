import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { HealthService } from '../health.service';
import { HealthCheck, HealthStatus } from '../entities/health-check.entity';
import type { HealthChecker } from '../interfaces/health-checker.interface';
import { jest } from '@jest/globals';

describe('HealthService', () => {
  let service: HealthService;
  let repository: Repository<HealthCheck>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockHealthChecker: HealthChecker = {
    getServiceName: () => 'test-service',
    check: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getRepositoryToken(HealthCheck),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    repository = module.get<Repository<HealthCheck>>(
      getRepositoryToken(HealthCheck),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerChecker', () => {
    it('should register a health checker', () => {
      service.registerChecker(mockHealthChecker);
      const services = service.getRegisteredServices();
      expect(services).toContain('test-service');
    });
  });

  describe('checkOverallHealth', () => {
    beforeEach(() => {
      service.registerChecker(mockHealthChecker);
    });

    it('should return overall health status', async () => {
      const mockCheckResult = {
        status: HealthStatus.HEALTHY,
        responseTime: 100,
        details: { test: 'data' },
      };
      (mockHealthChecker.check as jest.Mock).mockResolvedValue(mockCheckResult);
      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({});

      const result = await service.checkOverallHealth();

      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.services).toHaveLength(1);
      expect(result.services[0].serviceName).toBe('test-service');
      expect(result.services[0].status).toBe(HealthStatus.HEALTHY);
      expect(result.summary.total).toBe(1);
      expect(result.summary.healthy).toBe(1);
    });

    it('should handle unhealthy services', async () => {
      const mockCheckResult = {
        status: HealthStatus.UNHEALTHY,
        responseTime: 5000,
        errorMessage: 'Service unavailable',
      };
      (mockHealthChecker.check as jest.Mock).mockResolvedValue(mockCheckResult);
      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({});

      const result = await service.checkOverallHealth();

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.services[0].status).toBe(HealthStatus.UNHEALTHY);
      expect(result.services[0].errorMessage).toBe('Service unavailable');
      expect(result.summary.unhealthy).toBe(1);
    });

    it('should handle checker exceptions', async () => {
      (mockHealthChecker.check as jest.Mock).mockRejectedValue(
        new Error('Checker failed'),
      );
      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({});

      const result = await service.checkOverallHealth();

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
      expect(result.services[0].status).toBe(HealthStatus.UNHEALTHY);
      expect(result.services[0].errorMessage).toBe('Checker failed');
    });
  });

  describe('getServiceHealth', () => {
    beforeEach(() => {
      service.registerChecker(mockHealthChecker);
    });

    it('should return health for a specific service', async () => {
      const mockCheckResult = {
        status: HealthStatus.HEALTHY,
        responseTime: 150,
        details: { version: '1.0.0' },
      };
      (mockHealthChecker.check as jest.Mock).mockResolvedValue(mockCheckResult);

      const result = await service.getServiceHealth('test-service');

      expect(result).not.toBeNull();
      expect(result!.serviceName).toBe('test-service');
      expect(result!.status).toBe(HealthStatus.HEALTHY);
      expect(result!.responseTime).toBe(150);
    });

    it('should return null for unknown service', async () => {
      const result = await service.getServiceHealth('unknown-service');
      expect(result).toBeNull();
    });
  });

  describe('getHealthHistory', () => {
    it('should return health history for a service', async () => {
      const mockHealthChecks = [
        {
          status: HealthStatus.HEALTHY,
          responseTime: 100,
          checkedAt: new Date('2023-01-01T10:00:00Z'),
          errorMessage: null,
        },
        {
          status: HealthStatus.DEGRADED,
          responseTime: 800,
          checkedAt: new Date('2023-01-01T11:00:00Z'),
          errorMessage: null,
        },
      ];

      mockRepository.find.mockResolvedValue(mockHealthChecks);

      const result = await service.getHealthHistory('test-service', 24);

      expect(result.serviceName).toBe('test-service');
      expect(result.checks).toHaveLength(2);
      expect(result.checks[0].status).toBe(HealthStatus.HEALTHY);
      expect(result.checks[1].status).toBe(HealthStatus.DEGRADED);
    });
  });

  describe('findAll', () => {
    it('should return paginated health checks', async () => {
      const mockHealthChecks = [
        {
          id: '1',
          serviceName: 'database',
          status: HealthStatus.HEALTHY,
          responseTime: 50,
          createdAt: new Date(),
        },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockHealthChecks, 1]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('getHealthStats', () => {
    it('should return health statistics', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      mockRepository.count
        .mockResolvedValueOnce(1000) // total checks
        .mockResolvedValueOnce(100); // recent checks

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          serviceName: 'database',
          totalChecks: '50',
          healthyChecks: '45',
          degradedChecks: '3',
          unhealthyChecks: '2',
          avgResponseTime: '125.5',
        },
      ]);

      const result = await service.getHealthStats();

      expect(result.totalChecks).toBe(1000);
      expect(result.recentChecks).toBe(100);
      expect(result.serviceStats).toHaveLength(1);
      expect(result.serviceStats[0].serviceName).toBe('database');
      expect(result.serviceStats[0].totalChecks).toBe(50);
      expect(result.serviceStats[0].avgResponseTime).toBe(125.5);
    });
  });
});
