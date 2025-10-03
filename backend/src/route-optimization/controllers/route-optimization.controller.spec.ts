import { Test, TestingModule } from '@nestjs/testing';
import { RouteOptimizationController } from './route-optimization.controller';
import { RouteOptimizationService } from '../services/route-optimization.service';
import { OptimizeRouteDto } from '../dto/optimize-route.dto';
import { RouteOptimizationResultDto } from '../dto/route-optimization-result.dto';
import { RouteOptimizationRequest } from '../entities/route-optimization-request.entity';
import { OptimizationCriteria } from '../entities/route-optimization-request.entity';

describe('RouteOptimizationController', () => {
  let controller: RouteOptimizationController;
  let service: RouteOptimizationService;

  const mockOptimizeRouteDto: OptimizeRouteDto = {
    origin: 'New York',
    destination: 'Los Angeles',
    criteria: OptimizationCriteria.COMBINED,
    weight: 500,
    volume: 25,
    cargoType: 'general',
    constraints: {},
    preferences: {},
  };

  const mockOptimizationResult: RouteOptimizationResultDto = {
    routeId: 'route-1',
    routeName: 'Test Route',
    origin: 'New York',
    destination: 'Los Angeles',
    optimizedCost: 1500,
    optimizedDistance: 3000,
    optimizedDuration: 48,
    carbonFootprint: 500,
    reliabilityScore: 85,
    safetyScore: 90,
    currency: 'USD',
    segments: [],
    metadata: {},
  };

  const mockOptimizationRequest: RouteOptimizationRequest = {
    id: 'request-1',
    requesterId: 'user-1',
    routeId: 'route-1',
    origin: 'New York',
    destination: 'Los Angeles',
    criteria: OptimizationCriteria.COMBINED,
    status: 'completed' as any,
    weight: 500,
    volume: 25,
    cargoType: 'general',
    constraints: {},
    preferences: {},
    results: {},
    optimizedCost: 1500,
    optimizedDistance: 3000,
    optimizedDuration: 48,
    optimizedCarbonFootprint: 500,
    optimizedReliabilityScore: 85,
    optimizedSafetyScore: 90,
    errorMessage: null,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    route: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteOptimizationController],
      providers: [
        {
          provide: RouteOptimizationService,
          useValue: {
            optimizeRoute: jest.fn().mockResolvedValue(mockOptimizationResult),
            getOptimizationHistory: jest.fn().mockResolvedValue([mockOptimizationRequest]),
            getOptimizationRequest: jest.fn().mockResolvedValue(mockOptimizationRequest),
          },
        },
      ],
    }).compile();

    controller = module.get<RouteOptimizationController>(RouteOptimizationController);
    service = module.get<RouteOptimizationService>(RouteOptimizationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('optimizeRoute', () => {
    it('should optimize route successfully', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
      };

      const result = await controller.optimizeRoute(mockOptimizeRouteDto, mockRequest);
      
      expect(result).toEqual(mockOptimizationResult);
      expect(service.optimizeRoute).toHaveBeenCalledWith(mockOptimizeRouteDto, 'user-1');
    });

    it('should handle anonymous user', async () => {
      const mockRequest = {};

      const result = await controller.optimizeRoute(mockOptimizeRouteDto, mockRequest);
      
      expect(result).toEqual(mockOptimizationResult);
      expect(service.optimizeRoute).toHaveBeenCalledWith(mockOptimizeRouteDto, 'anonymous');
    });
  });

  describe('getOptimizationHistory', () => {
    it('should return optimization history', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
      };

      const result = await controller.getOptimizationHistory(mockRequest, 10);
      
      expect(result).toEqual([mockOptimizationRequest]);
      expect(service.getOptimizationHistory).toHaveBeenCalledWith('user-1', 10);
    });

    it('should handle anonymous user', async () => {
      const mockRequest = {};

      const result = await controller.getOptimizationHistory(mockRequest);
      
      expect(result).toEqual([mockOptimizationRequest]);
      expect(service.getOptimizationHistory).toHaveBeenCalledWith('anonymous', undefined);
    });
  });

  describe('getOptimizationRequest', () => {
    it('should return optimization request by id', async () => {
      const result = await controller.getOptimizationRequest('request-1');
      
      expect(result).toEqual(mockOptimizationRequest);
      expect(service.getOptimizationRequest).toHaveBeenCalledWith('request-1');
    });
  });
});
