import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { RouteOptimizationModule } from '../src/route-optimization/route-optimization.module';
import { Route } from '../src/route-optimization/entities/route.entity';
import { RouteSegment } from '../src/route-optimization/entities/route-segment.entity';
import { Carrier } from '../src/route-optimization/entities/carrier.entity';
import { RouteOptimizationRequest } from '../src/route-optimization/entities/route-optimization-request.entity';
import { OptimizationCriteria } from '../src/route-optimization/entities/route-optimization-request.entity';
import { RouteType, RouteStatus } from '../src/route-optimization/entities/route.entity';
import { CarrierType, CarrierStatus } from '../src/route-optimization/entities/carrier.entity';

describe('Route Optimization (e2e)', () => {
  let app: INestApplication;
  let routeId: string;
  let carrierId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Route, RouteSegment, Carrier, RouteOptimizationRequest],
          synchronize: true,
        }),
        RouteOptimizationModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Routes', () => {
    it('should create a route', () => {
      const createRouteDto = {
        name: 'Test Route',
        description: 'Test Description',
        origin: 'New York',
        destination: 'Los Angeles',
        routeType: RouteType.DOMESTIC,
        totalDistance: 3000,
        estimatedDuration: 48,
        baseCost: 1500,
        currency: 'USD',
        carbonFootprint: 500,
        reliabilityScore: 85,
        safetyScore: 90,
      };

      return request(app.getHttpServer())
        .post('/routes')
        .send(createRouteDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(createRouteDto.name);
          expect(res.body.origin).toBe(createRouteDto.origin);
          expect(res.body.destination).toBe(createRouteDto.destination);
          routeId = res.body.id;
        });
    });

    it('should get all routes', () => {
      return request(app.getHttpServer())
        .get('/routes')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('routes');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(Array.isArray(res.body.routes)).toBe(true);
        });
    });

    it('should get route by id', () => {
      return request(app.getHttpServer())
        .get(`/routes/${routeId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(routeId);
          expect(res.body.name).toBe('Test Route');
        });
    });

    it('should update route', () => {
      const updateRouteDto = {
        name: 'Updated Route',
        description: 'Updated Description',
      };

      return request(app.getHttpServer())
        .patch(`/routes/${routeId}`)
        .send(updateRouteDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateRouteDto.name);
          expect(res.body.description).toBe(updateRouteDto.description);
        });
    });

    it('should search routes', () => {
      return request(app.getHttpServer())
        .get('/routes/search?q=New York')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get route statistics', () => {
      return request(app.getHttpServer())
        .get('/routes/statistics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalRoutes');
          expect(res.body).toHaveProperty('activeRoutes');
          expect(res.body).toHaveProperty('routesByType');
          expect(res.body).toHaveProperty('averageDistance');
          expect(res.body).toHaveProperty('averageCost');
          expect(res.body).toHaveProperty('averageDuration');
        });
    });
  });

  describe('Carriers', () => {
    it('should create a carrier', () => {
      const createCarrierDto = {
        name: 'Test Carrier',
        description: 'Test Carrier Description',
        carrierType: CarrierType.TRUCKING_COMPANY,
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
        reliabilityScore: 85,
        safetyScore: 90,
        costScore: 80,
        speedScore: 75,
      };

      return request(app.getHttpServer())
        .post('/carriers')
        .send(createCarrierDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(createCarrierDto.name);
          expect(res.body.carrierType).toBe(createCarrierDto.carrierType);
          carrierId = res.body.id;
        });
    });

    it('should get all carriers', () => {
      return request(app.getHttpServer())
        .get('/carriers')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('carriers');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(Array.isArray(res.body.carriers)).toBe(true);
        });
    });

    it('should get carrier by id', () => {
      return request(app.getHttpServer())
        .get(`/carriers/${carrierId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(carrierId);
          expect(res.body.name).toBe('Test Carrier');
        });
    });

    it('should update carrier', () => {
      const updateCarrierDto = {
        name: 'Updated Carrier',
        description: 'Updated Description',
      };

      return request(app.getHttpServer())
        .patch(`/carriers/${carrierId}`)
        .send(updateCarrierDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateCarrierDto.name);
          expect(res.body.description).toBe(updateCarrierDto.description);
        });
    });

    it('should search carriers', () => {
      return request(app.getHttpServer())
        .get('/carriers/search?q=Test Carrier')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get carrier statistics', () => {
      return request(app.getHttpServer())
        .get('/carriers/statistics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalCarriers');
          expect(res.body).toHaveProperty('activeCarriers');
          expect(res.body).toHaveProperty('carriersByType');
          expect(res.body).toHaveProperty('averageReliabilityScore');
          expect(res.body).toHaveProperty('averageSafetyScore');
          expect(res.body).toHaveProperty('averageCostScore');
          expect(res.body).toHaveProperty('averageSpeedScore');
        });
    });

    it('should get top carriers', () => {
      return request(app.getHttpServer())
        .get('/carriers/top?limit=5')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should update carrier scores', () => {
      const scores = {
        reliabilityScore: 90,
        safetyScore: 95,
        costScore: 85,
        speedScore: 80,
      };

      return request(app.getHttpServer())
        .patch(`/carriers/${carrierId}/scores`)
        .send(scores)
        .expect(200)
        .expect((res) => {
          expect(res.body.reliabilityScore).toBe(scores.reliabilityScore);
          expect(res.body.safetyScore).toBe(scores.safetyScore);
          expect(res.body.costScore).toBe(scores.costScore);
          expect(res.body.speedScore).toBe(scores.speedScore);
        });
    });
  });

  describe('Route Optimization', () => {
    it('should optimize route', () => {
      const optimizeRouteDto = {
        origin: 'New York',
        destination: 'Los Angeles',
        criteria: OptimizationCriteria.COMBINED,
        weight: 500,
        volume: 25,
        cargoType: 'general',
        constraints: {},
        preferences: {},
      };

      return request(app.getHttpServer())
        .post('/route-optimization/optimize')
        .send(optimizeRouteDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('routeId');
          expect(res.body).toHaveProperty('routeName');
          expect(res.body).toHaveProperty('origin');
          expect(res.body).toHaveProperty('destination');
          expect(res.body).toHaveProperty('optimizedCost');
          expect(res.body).toHaveProperty('optimizedDistance');
          expect(res.body).toHaveProperty('optimizedDuration');
          expect(res.body).toHaveProperty('carbonFootprint');
          expect(res.body).toHaveProperty('reliabilityScore');
          expect(res.body).toHaveProperty('safetyScore');
          expect(res.body).toHaveProperty('currency');
          expect(res.body).toHaveProperty('segments');
        });
    });

    it('should get optimization history', () => {
      return request(app.getHttpServer())
        .get('/route-optimization/history?limit=10')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should handle optimization with constraints', () => {
      const optimizeRouteDto = {
        origin: 'New York',
        destination: 'Los Angeles',
        criteria: OptimizationCriteria.COST,
        weight: 500,
        volume: 25,
        cargoType: 'general',
        maxCost: 2000,
        maxDuration: 60,
        maxDistance: 4000,
        minReliabilityScore: 80,
        minSafetyScore: 85,
        maxCarbonFootprint: 600,
        constraints: {},
        preferences: {},
      };

      return request(app.getHttpServer())
        .post('/route-optimization/optimize')
        .send(optimizeRouteDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('routeId');
          expect(res.body.optimizedCost).toBeLessThanOrEqual(2000);
        });
    });

    it('should handle optimization with preferred carriers', () => {
      const optimizeRouteDto = {
        origin: 'New York',
        destination: 'Los Angeles',
        criteria: OptimizationCriteria.RELIABILITY,
        weight: 500,
        volume: 25,
        cargoType: 'general',
        preferredCarriers: [carrierId],
        constraints: {},
        preferences: {},
      };

      return request(app.getHttpServer())
        .post('/route-optimization/optimize')
        .send(optimizeRouteDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('routeId');
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent route', () => {
      return request(app.getHttpServer())
        .get('/routes/non-existent-id')
        .expect(404);
    });

    it('should return 404 for non-existent carrier', () => {
      return request(app.getHttpServer())
        .get('/carriers/non-existent-id')
        .expect(404);
    });

    it('should return 404 for non-existent optimization request', () => {
      return request(app.getHttpServer())
        .get('/route-optimization/request/non-existent-id')
        .expect(404);
    });

    it('should return 400 for invalid route data', () => {
      const invalidRouteDto = {
        name: '', // Invalid: empty name
        origin: 'New York',
        destination: 'Los Angeles',
        routeType: 'invalid-type', // Invalid route type
        totalDistance: -100, // Invalid: negative distance
        estimatedDuration: -10, // Invalid: negative duration
        baseCost: -500, // Invalid: negative cost
      };

      return request(app.getHttpServer())
        .post('/routes')
        .send(invalidRouteDto)
        .expect(400);
    });

    it('should return 400 for invalid carrier data', () => {
      const invalidCarrierDto = {
        name: '', // Invalid: empty name
        carrierType: 'invalid-type', // Invalid carrier type
        reliabilityScore: 150, // Invalid: score > 100
        safetyScore: -10, // Invalid: negative score
      };

      return request(app.getHttpServer())
        .post('/carriers')
        .send(invalidCarrierDto)
        .expect(400);
    });

    it('should return 400 for invalid optimization request', () => {
      const invalidOptimizeDto = {
        origin: '', // Invalid: empty origin
        destination: '', // Invalid: empty destination
        criteria: 'invalid-criteria', // Invalid criteria
        weight: -100, // Invalid: negative weight
        volume: -50, // Invalid: negative volume
      };

      return request(app.getHttpServer())
        .post('/route-optimization/optimize')
        .send(invalidOptimizeDto)
        .expect(400);
    });
  });

  describe('Cleanup', () => {
    it('should delete route', () => {
      return request(app.getHttpServer())
        .delete(`/routes/${routeId}`)
        .expect(200);
    });

    it('should delete carrier', () => {
      return request(app.getHttpServer())
        .delete(`/carriers/${carrierId}`)
        .expect(200);
    });
  });
});
