import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteService } from './route.service';
import { Route } from '../entities/route.entity';
import { RouteSegment } from '../entities/route-segment.entity';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';
import { RouteType, RouteStatus } from '../entities/route.entity';

describe('RouteService', () => {
  let service: RouteService;
  let routeRepository: Repository<Route>;
  let segmentRepository: Repository<RouteSegment>;

  const mockRoute: Route = {
    id: 'route-1',
    name: 'Test Route',
    description: 'Test Description',
    origin: 'New York',
    destination: 'Los Angeles',
    routeType: RouteType.DOMESTIC,
    status: RouteStatus.ACTIVE,
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

  const mockSegment: RouteSegment = {
    id: 'segment-1',
    routeId: 'route-1',
    segmentType: 'road' as any,
    origin: 'New York',
    destination: 'Chicago',
    distance: 1500,
    duration: 24,
    cost: 750,
    currency: 'USD',
    sequence: 1,
    status: 'active' as any,
    carbonFootprint: 250,
    reliabilityScore: 85,
    safetyScore: 90,
    metadata: {},
    restrictions: {},
    capabilities: {},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    route: mockRoute,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        {
          provide: getRepositoryToken(Route),
          useValue: {
            create: jest.fn().mockReturnValue(mockRoute),
            save: jest.fn().mockResolvedValue(mockRoute),
            find: jest.fn().mockResolvedValue([mockRoute]),
            findOne: jest.fn().mockResolvedValue(mockRoute),
            remove: jest.fn().mockResolvedValue(mockRoute),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockRoute]),
              getCount: jest.fn().mockResolvedValue(1),
            })),
          },
        },
        {
          provide: getRepositoryToken(RouteSegment),
          useValue: {
            create: jest.fn().mockReturnValue(mockSegment),
            save: jest.fn().mockResolvedValue(mockSegment),
            find: jest.fn().mockResolvedValue([mockSegment]),
            findOne: jest.fn().mockResolvedValue(mockSegment),
            remove: jest.fn().mockResolvedValue(mockSegment),
          },
        },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
    routeRepository = module.get<Repository<Route>>(getRepositoryToken(Route));
    segmentRepository = module.get<Repository<RouteSegment>>(getRepositoryToken(RouteSegment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new route', async () => {
      const createRouteDto: CreateRouteDto = {
        name: 'Test Route',
        description: 'Test Description',
        origin: 'New York',
        destination: 'Los Angeles',
        routeType: RouteType.DOMESTIC,
        totalDistance: 3000,
        estimatedDuration: 48,
        baseCost: 1500,
      };

      const result = await service.create(createRouteDto);
      
      expect(result).toEqual(mockRoute);
      expect(routeRepository.create).toHaveBeenCalledWith(createRouteDto);
      expect(routeRepository.save).toHaveBeenCalledWith(mockRoute);
    });
  });

  describe('findAll', () => {
    it('should return paginated routes with filters', async () => {
      const result = await service.findAll(1, 10, {
        origin: 'New York',
        destination: 'Los Angeles',
        routeType: 'domestic',
        status: 'active',
        isActive: true,
      });

      expect(result).toEqual({
        routes: [mockRoute],
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should return routes without filters', async () => {
      const result = await service.findAll();
      
      expect(result).toEqual({
        routes: [mockRoute],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a route by id', async () => {
      const result = await service.findOne('route-1');
      
      expect(result).toEqual(mockRoute);
      expect(routeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'route-1' },
        relations: ['segments'],
      });
    });

    it('should throw NotFoundException when route not found', async () => {
      jest.spyOn(routeRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow('Route not found');
    });
  });

  describe('update', () => {
    it('should update a route', async () => {
      const updateRouteDto: UpdateRouteDto = {
        name: 'Updated Route',
        description: 'Updated Description',
      };

      const result = await service.update('route-1', updateRouteDto);
      
      expect(result).toEqual(mockRoute);
      expect(routeRepository.save).toHaveBeenCalledWith(mockRoute);
    });
  });

  describe('remove', () => {
    it('should remove a route', async () => {
      await service.remove('route-1');
      
      expect(routeRepository.remove).toHaveBeenCalledWith(mockRoute);
    });
  });

  describe('addSegment', () => {
    it('should add a segment to a route', async () => {
      const segmentData = {
        segmentType: 'road' as any,
        origin: 'New York',
        destination: 'Chicago',
        distance: 1500,
        duration: 24,
        cost: 750,
        sequence: 1,
      };

      const result = await service.addSegment('route-1', segmentData);
      
      expect(result).toEqual(mockSegment);
      expect(segmentRepository.create).toHaveBeenCalledWith({
        ...segmentData,
        routeId: 'route-1',
      });
      expect(segmentRepository.save).toHaveBeenCalledWith(mockSegment);
    });
  });

  describe('updateSegment', () => {
    it('should update a route segment', async () => {
      const segmentData = {
        distance: 1600,
        duration: 26,
        cost: 800,
      };

      const result = await service.updateSegment('segment-1', segmentData);
      
      expect(result).toEqual(mockSegment);
      expect(segmentRepository.save).toHaveBeenCalledWith(mockSegment);
    });

    it('should throw NotFoundException when segment not found', async () => {
      jest.spyOn(segmentRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateSegment('non-existent', {})).rejects.toThrow('Route segment not found');
    });
  });

  describe('removeSegment', () => {
    it('should remove a route segment', async () => {
      await service.removeSegment('segment-1');
      
      expect(segmentRepository.remove).toHaveBeenCalledWith(mockSegment);
    });

    it('should throw NotFoundException when segment not found', async () => {
      jest.spyOn(segmentRepository, 'findOne').mockResolvedValue(null);

      await expect(service.removeSegment('non-existent')).rejects.toThrow('Route segment not found');
    });
  });

  describe('getRoutesByOriginDestination', () => {
    it('should return routes by origin and destination', async () => {
      const result = await service.getRoutesByOriginDestination('New York', 'Los Angeles');
      
      expect(result).toEqual([mockRoute]);
    });
  });

  describe('getRoutesByType', () => {
    it('should return routes by type', async () => {
      const result = await service.getRoutesByType('domestic');
      
      expect(result).toEqual([mockRoute]);
    });
  });

  describe('searchRoutes', () => {
    it('should search routes by term', async () => {
      const result = await service.searchRoutes('New York');
      
      expect(result).toEqual([mockRoute]);
    });
  });

  describe('getRouteStatistics', () => {
    it('should return route statistics', async () => {
      const result = await service.getRouteStatistics();
      
      expect(result).toEqual({
        totalRoutes: 1,
        activeRoutes: 1,
        routesByType: { domestic: 1 },
        averageDistance: 3000,
        averageCost: 1500,
        averageDuration: 48,
      });
    });
  });
});
