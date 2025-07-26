import { Test, type TestingModule } from '@nestjs/testing';
import { HealthController } from '../health.controller';
import { HealthService } from '../health.service';
import { HealthStatus, ServiceType } from '../entities/health-check.entity';
import { jest } from '@jest/globals';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  const mockService = {
    checkOverallHealth: jest.fn(),
    getServiceHealth: jest.fn(),
    getHealthHistory: jest.fn(),
    findAll: jest.fn(),
    getHealthStats: jest.fn(),
    getRegisteredServices: jest.fn(),
  };

  const mockOverallHealth = {
    status: HealthStatus.HEALTHY,
    timestamp: new Date(),
    uptime: 3600,
    version: '1.0.0',
    environment: 'test',
    services: [
      {
        serviceName: 'database',
        serviceType: ServiceType.DATABASE,
        status: HealthStatus.HEALTHY,
        responseTime: 50,
        checkedAt: new Date(),
      },
    ],
    summary: {
      total: 1,
      healthy: 1,
      degraded: 0,
      unhealthy: 0,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOverallHealth', () => {
    it('should return overall health status', async () => {
      mockService.checkOverallHealth.mockResolvedValue(mockOverallHealth);

      const result = await controller.getOverallHealth();

      expect(result).toEqual(mockOverallHealth);
      expect(service.checkOverallHealth).toHaveBeenCalled();
    });
  });

  describe('getLiveness', () => {
    it('should return liveness status', async () => {
      const result = await controller.getLiveness();

      expect(result.status).toBe('alive');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('getReadiness', () => {
    it('should return readiness status when healthy', async () => {
      mockService.checkOverallHealth.mockResolvedValue(mockOverallHealth);

      const result = await controller.getReadiness();

      expect(result.status).toBe('ready');
      expect(result.ready).toBe(true);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should return not ready when unhealthy', async () => {
      const unhealthyStatus = {
        ...mockOverallHealth,
        status: HealthStatus.UNHEALTHY,
      };
      mockService.checkOverallHealth.mockResolvedValue(unhealthyStatus);

      const result = await controller.getReadiness();

      expect(result.status).toBe('not ready');
      expect(result.ready).toBe(false);
    });
  });

  describe('getServices', () => {
    it('should return list of registered services', async () => {
      mockService.getRegisteredServices.mockReturnValue([
        'database',
        'redis',
        'email',
      ]);

      const result = await controller.getServices();

      expect(result.services).toEqual(['database', 'redis', 'email']);
    });
  });

  describe('getServiceHealth', () => {
    it('should return health for a specific service', async () => {
      const serviceHealth = {
        serviceName: 'database',
        serviceType: ServiceType.DATABASE,
        status: HealthStatus.HEALTHY,
        responseTime: 75,
        checkedAt: new Date(),
      };

      mockService.getServiceHealth.mockResolvedValue(serviceHealth);

      const result = await controller.getServiceHealth('database');

      expect(result).toEqual(serviceHealth);
      expect(service.getServiceHealth).toHaveBeenCalledWith('database');
    });
  });

  describe('getServiceHistory', () => {
    it('should return service health history', async () => {
      const history = {
        serviceName: 'database',
        checks: [
          {
            status: HealthStatus.HEALTHY,
            responseTime: 50,
            checkedAt: new Date(),
          },
        ],
      };

      mockService.getHealthHistory.mockResolvedValue(history);

      const result = await controller.getServiceHistory('database', 24);

      expect(result).toEqual(history);
      expect(service.getHealthHistory).toHaveBeenCalledWith('database', 24);
    });

    it('should use default hours when not provided', async () => {
      const history = {
        serviceName: 'database',
        checks: [],
      };

      mockService.getHealthHistory.mockResolvedValue(history);

      await controller.getServiceHistory('database');

      expect(service.getHealthHistory).toHaveBeenCalledWith('database', 24);
    });
  });

  describe('getHealthChecks', () => {
    it('should return paginated health checks', async () => {
      const paginatedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      };

      mockService.findAll.mockResolvedValue(paginatedResult);

      const filterDto = { page: 1, limit: 50 };
      const result = await controller.getHealthChecks(filterDto);

      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('getHealthStats', () => {
    it('should return health statistics', async () => {
      const stats = {
        totalChecks: 1000,
        recentChecks: 100,
        serviceStats: [
          {
            serviceName: 'database',
            totalChecks: 50,
            healthyChecks: 45,
            degradedChecks: 3,
            unhealthyChecks: 2,
            avgResponseTime: 125.5,
          },
        ],
      };

      mockService.getHealthStats.mockResolvedValue(stats);

      const result = await controller.getHealthStats();

      expect(result).toEqual(stats);
      expect(service.getHealthStats).toHaveBeenCalled();
    });
  });
});
