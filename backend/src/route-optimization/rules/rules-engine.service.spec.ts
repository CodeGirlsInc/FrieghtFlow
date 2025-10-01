import { Test, TestingModule } from '@nestjs/testing';
import { RulesEngineService } from './rules-engine.service';
import { CostOptimizationRule } from './cost-optimization.rule';
import { TimeOptimizationRule } from './time-optimization.rule';
import { ReliabilityRule } from './reliability.rule';
import { SafetyRule } from './safety.rule';
import { CarbonFootprintRule } from './carbon-footprint.rule';
import { CarrierAvailabilityRule } from './carrier-availability.rule';
import { Route } from '../entities/route.entity';
import { Carrier } from '../entities/carrier.entity';
import { OptimizeRouteDto } from '../dto/optimize-route.dto';
import { OptimizationCriteria } from '../entities/route-optimization-request.entity';
import { RouteType, RouteStatus } from '../entities/route.entity';
import { CarrierType, CarrierStatus } from '../entities/carrier.entity';

describe('RulesEngineService', () => {
  let service: RulesEngineService;
  let costRule: CostOptimizationRule;
  let timeRule: TimeOptimizationRule;
  let reliabilityRule: ReliabilityRule;
  let safetyRule: SafetyRule;
  let carbonRule: CarbonFootprintRule;
  let carrierRule: CarrierAvailabilityRule;

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

  const mockCarrier: Carrier = {
    id: 'carrier-1',
    name: 'Test Carrier',
    description: 'Test Carrier Description',
    carrierType: CarrierType.TRUCKING_COMPANY,
    status: CarrierStatus.ACTIVE,
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
        RulesEngineService,
        CostOptimizationRule,
        TimeOptimizationRule,
        ReliabilityRule,
        SafetyRule,
        CarbonFootprintRule,
        CarrierAvailabilityRule,
      ],
    }).compile();

    service = module.get<RulesEngineService>(RulesEngineService);
    costRule = module.get<CostOptimizationRule>(CostOptimizationRule);
    timeRule = module.get<TimeOptimizationRule>(TimeOptimizationRule);
    reliabilityRule = module.get<ReliabilityRule>(ReliabilityRule);
    safetyRule = module.get<SafetyRule>(SafetyRule);
    carbonRule = module.get<CarbonFootprintRule>(CarbonFootprintRule);
    carrierRule = module.get<CarrierAvailabilityRule>(CarrierAvailabilityRule);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('evaluateRoute', () => {
    it('should evaluate a single route', () => {
      const result = service.evaluateRoute(mockRoute, [mockCarrier], mockOptimizeRouteDto);
      
      expect(result).toBeDefined();
      expect(result.route).toEqual(mockRoute);
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
      expect(result.ruleResults).toBeDefined();
      expect(result.passed).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should handle route that fails constraints', () => {
      const expensiveRoute = { ...mockRoute, baseCost: 10000 };
      const requestWithMaxCost = { ...mockOptimizeRouteDto, maxCost: 5000 };
      
      const result = service.evaluateRoute(expensiveRoute, [mockCarrier], requestWithMaxCost);
      
      expect(result).toBeDefined();
      expect(result.passed).toBe(false);
    });
  });

  describe('evaluateRoutes', () => {
    it('should evaluate multiple routes', () => {
      const routes = [mockRoute, { ...mockRoute, id: 'route-2', baseCost: 2000 }];
      const result = service.evaluateRoutes(routes, [mockCarrier], mockOptimizeRouteDto);
      
      expect(result).toHaveLength(2);
      expect(result[0].route).toEqual(routes[0]);
      expect(result[1].route).toEqual(routes[1]);
    });
  });

  describe('getBestRoutes', () => {
    it('should return best routes sorted by score', () => {
      const routes = [
        { ...mockRoute, id: 'route-1', baseCost: 1000 },
        { ...mockRoute, id: 'route-2', baseCost: 2000 },
        { ...mockRoute, id: 'route-3', baseCost: 3000 },
      ];
      
      const result = service.getBestRoutes(routes, [mockCarrier], mockOptimizeRouteDto, 2);
      
      expect(result).toHaveLength(2);
      expect(result[0].totalScore).toBeGreaterThanOrEqual(result[1].totalScore);
    });

    it('should filter out failed routes in strict mode', () => {
      const routes = [
        { ...mockRoute, id: 'route-1', baseCost: 1000 },
        { ...mockRoute, id: 'route-2', baseCost: 10000 }, // Expensive route
      ];
      const requestWithMaxCost = { ...mockOptimizeRouteDto, maxCost: 5000, constraints: { strictMode: true } };
      
      const result = service.getBestRoutes(routes, [mockCarrier], requestWithMaxCost, 5);
      
      expect(result).toHaveLength(1);
      expect(result[0].route.id).toBe('route-1');
    });
  });

  describe('getRuleByName', () => {
    it('should return rule by name', () => {
      const rule = service.getRuleByName('Cost Optimization');
      
      expect(rule).toBeDefined();
      expect(rule?.name).toBe('Cost Optimization');
    });

    it('should return undefined for non-existent rule', () => {
      const rule = service.getRuleByName('Non-existent Rule');
      
      expect(rule).toBeUndefined();
    });
  });

  describe('getAllRules', () => {
    it('should return all rules', () => {
      const rules = service.getAllRules();
      
      expect(rules).toBeDefined();
      expect(rules.length).toBeGreaterThan(0);
      expect(rules.every(rule => rule.name && rule.description && rule.priority !== undefined)).toBe(true);
    });
  });

  describe('addCustomRule', () => {
    it('should add a custom rule', () => {
      const customRule = {
        name: 'Custom Rule',
        description: 'Custom rule for testing',
        priority: 10,
        evaluate: jest.fn().mockReturnValue({
          passed: true,
          score: 50,
          message: 'Custom rule passed',
        }),
      };
      
      service.addCustomRule(customRule);
      const rules = service.getAllRules();
      
      expect(rules).toContain(customRule);
    });
  });

  describe('removeCustomRule', () => {
    it('should remove a custom rule', () => {
      const customRule = {
        name: 'Custom Rule',
        description: 'Custom rule for testing',
        priority: 10,
        evaluate: jest.fn().mockReturnValue({
          passed: true,
          score: 50,
          message: 'Custom rule passed',
        }),
      };
      
      service.addCustomRule(customRule);
      const removed = service.removeCustomRule('Custom Rule');
      
      expect(removed).toBe(true);
      const rules = service.getAllRules();
      expect(rules).not.toContain(customRule);
    });

    it('should return false for non-existent rule', () => {
      const removed = service.removeCustomRule('Non-existent Rule');
      
      expect(removed).toBe(false);
    });
  });
});
