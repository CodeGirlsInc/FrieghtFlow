import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteOptimizationService } from './route-optimization.service';
import { Route } from '../entities/route.entity';
import { RouteSegment } from '../entities/route-segment.entity';
import { Carrier } from '../entities/carrier.entity';
import { RouteOptimizationRequest } from '../entities/route-optimization-request.entity';
import { RulesEngineService } from '../rules/rules-engine.service';
import { OptimizeRouteDto } from '../dto/optimize-route.dto';
import { OptimizationCriteria } from '../entities/route-optimization-request.entity';

describe('RouteOptimizationService', () => {
  let service: RouteOptimizationService;
  let routeRepository: Repository<Route>;
  let segmentRepository: Repository<RouteSegment>;
  let carrierRepository: Repository<Carrier>;
  let optimizationRequestRepository: Repository<RouteOptimizationRequest>;
  let rulesEngine: RulesEngineService;

  const mockRoute: Route = {
    id: 'route-1',
    name: 'Test Route',
    description: 'Test Description',
    origin: 'New York',
    destination: 'Los Angeles',
    routeType: 'domestic' as any,
    status: 'active' as any,
    totalDistance: 3000,
    estimatedDuration: 48,
    baseCost: 1500,
    currency: 'USD',
    carbonFootprint: 500,
    reliabilityScore: 85,
    safetyScore: 90,
    metadata: {},
    restrictions: {},
    capabilities: {},
    optimizationAlgorithm: 'dijkstra' as any,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    segments: [],
    optimizationRequests: [],
  };

  const mockCarrier: Carrier = {
    id: 'carrier-1',
    name: 'Test Carrier',
    description: 'Test Carrier Description',
    carrierType: 'trucking_company' as any,
    status: 'active' as any,
    website: 'https://test.com',
    contactEmail: 'test@test.com',
    contactPhone: '+1234567890',
    headquarters: 'New York',
    serviceAreas: ['US'],
    capabilities: {
      cargoTypes: ['general'],
      maxWeight: 1000,
      maxVolume: 50,
    },
    certifications: {},
    reliabilityScore: 85,
    safetyScore: 90,
    costScore: 80,
    speedScore: 75,
    metadata: {},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteOptimizationService,
        {
          provide: getRepositoryToken(Route),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockRoute]),
            })),
          },
        },
        {
          provide: getRepositoryToken(RouteSegment),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(Carrier),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockCarrier]),
            })),
          },
        },
        {
          provide: getRepositoryToken(RouteOptimizationRequest),
          useValue: {
            create: jest.fn().mockReturnValue({}),
            save: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: RulesEngineService,
          useValue: {
            evaluateRoutes: jest.fn().mockReturnValue([
              {
                route: mockRoute,
                totalScore: 85,
                ruleResults: [],
                passed: true,
                metadata: {},
              },
            ]),
          },
        },
      ],
    }).compile();

    service = module.get<RouteOptimizationService>(RouteOptimizationService);
    routeRepository = module.get<Repository<Route>>(getRepositoryToken(Route));
    segmentRepository = module.get<Repository<RouteSegment>>(getRepositoryToken(RouteSegment));
    carrierRepository = module.get<Repository<Carrier>>(getRepositoryToken(Carrier));
    optimizationRequestRepository = module.get<Repository<RouteOptimizationRequest>>(
      getRepositoryToken(RouteOptimizationRequest),
    );
    rulesEngine = module.get<RulesEngineService>(RulesEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('optimizeRoute', () => {
    it('should optimize route successfully', async () => {
      const result = await service.optimizeRoute(mockOptimizeRouteDto, 'user-1');
      
      expect(result).toBeDefined();
      expect(result.routeId).toBe(mockRoute.id);
      expect(result.origin).toBe(mockRoute.origin);
      expect(result.destination).toBe(mockRoute.destination);
    });

    it('should throw NotFoundException when no routes found', async () => {
      jest.spyOn(routeRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any);

      await expect(service.optimizeRoute(mockOptimizeRouteDto, 'user-1')).rejects.toThrow('No routes found for the specified origin and destination');
    });

    it('should throw BadRequestException when no suitable routes found', async () => {
      jest.spyOn(rulesEngine, 'evaluateRoutes').mockReturnValue([]);

      await expect(service.optimizeRoute(mockOptimizeRouteDto, 'user-1')).rejects.toThrow('No suitable routes found based on the specified criteria');
    });
  });

  describe('getOptimizationHistory', () => {
    it('should return optimization history', async () => {
      const mockHistory = [
        {
          id: 'request-1',
          requesterId: 'user-1',
          origin: 'New York',
          destination: 'Los Angeles',
          criteria: OptimizationCriteria.COMBINED,
          status: 'completed' as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(optimizationRequestRepository, 'find').mockResolvedValue(mockHistory as any);

      const result = await service.getOptimizationHistory('user-1', 10);
      
      expect(result).toEqual(mockHistory);
      expect(optimizationRequestRepository.find).toHaveBeenCalledWith({
        where: { requesterId: 'user-1' },
        order: { createdAt: 'DESC' },
        take: 10,
      });
    });
  });

  describe('getOptimizationRequest', () => {
    it('should return optimization request by id', async () => {
      const mockRequest = {
        id: 'request-1',
        requesterId: 'user-1',
        origin: 'New York',
        destination: 'Los Angeles',
        criteria: OptimizationCriteria.COMBINED,
        status: 'completed' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(optimizationRequestRepository, 'findOne').mockResolvedValue(mockRequest as any);

      const result = await service.getOptimizationRequest('request-1');
      
      expect(result).toEqual(mockRequest);
      expect(optimizationRequestRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'request-1' },
        relations: ['route'],
      });
    });

    it('should throw NotFoundException when request not found', async () => {
      jest.spyOn(optimizationRequestRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getOptimizationRequest('non-existent')).rejects.toThrow('Optimization request not found');
    });
  });
});
