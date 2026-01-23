import { Test, TestingModule } from '@nestjs/testing';
import { CostCalculationService } from './cost-calculation.service';
import { Address } from '../entities/freight-job.entity';

describe('CostCalculationService', () => {
  let service: CostCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CostCalculationService],
    }).compile();

    service = module.get<CostCalculationService>(CostCalculationService);
  });

  describe('calculateEstimatedCost', () => {
    const originAddress: Address = {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      latitude: 40.7128,
      longitude: -74.006,
    };

    const destinationAddress: Address = {
      street: '456 Market St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA',
      latitude: 37.7749,
      longitude: -122.4194,
    };

    it('should calculate cost correctly for general cargo', () => {
      const cost = service.calculateEstimatedCost(
        originAddress,
        destinationAddress,
        100, // weight in kg
        'general',
      );

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('should apply cargo type multiplier for fragile items', () => {
      const generalCost = service.calculateEstimatedCost(
        originAddress,
        destinationAddress,
        100,
        'general',
      );

      const fragileCost = service.calculateEstimatedCost(
        originAddress,
        destinationAddress,
        100,
        'fragile',
      );

      expect(fragileCost).toBeGreaterThan(generalCost);
    });

    it('should apply cargo type multiplier for hazardous materials', () => {
      const generalCost = service.calculateEstimatedCost(
        originAddress,
        destinationAddress,
        100,
        'general',
      );

      const hazardousCost = service.calculateEstimatedCost(
        originAddress,
        destinationAddress,
        100,
        'hazardous',
      );

      expect(hazardousCost).toBeGreaterThan(fragileCost);
    });

    it('should apply minimum charge of $50', () => {
      const cost = service.calculateEstimatedCost(
        originAddress,
        destinationAddress,
        1, // very light cargo
        'general',
      );

      expect(cost).toBe(50);
    });

    it('should round cost to 2 decimal places', () => {
      const cost = service.calculateEstimatedCost(
        originAddress,
        destinationAddress,
        50,
        'electronics',
      );

      const decimalPlaces = (cost.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should calculate cost with weight multiplier', () => {
      const lightCost = service.calculateEstimatedCost(
        originAddress,
        destinationAddress,
        50,
        'general',
      );

      const heavyCost = service.calculateEstimatedCost(
        originAddress,
        destinationAddress,
        500,
        'general',
      );

      expect(heavyCost).toBeGreaterThan(lightCost);
    });
  });

  describe('estimateDistanceAndDuration', () => {
    const ny: Address = {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      latitude: 40.7128,
      longitude: -74.006,
    };

    const la: Address = {
      street: '456 Market St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
      latitude: 34.0522,
      longitude: -118.2437,
    };

    it('should calculate distance and duration with coordinates', () => {
      const result = service.estimateDistanceAndDuration(ny, la);

      expect(result.distance).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should estimate distance from city names', () => {
      const addressWithoutCoords1: Address = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      };

      const addressWithoutCoords2: Address = {
        street: '456 Market St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
      };

      const result = service.estimateDistanceAndDuration(
        addressWithoutCoords1,
        addressWithoutCoords2,
      );

      expect(result.distance).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should return default distance if cities not recognized', () => {
      const unknownAddress1: Address = {
        street: '123 Main St',
        city: 'UnknownCity1',
        state: 'XX',
        zipCode: '00000',
        country: 'USA',
      };

      const unknownAddress2: Address = {
        street: '456 Market St',
        city: 'UnknownCity2',
        state: 'YY',
        zipCode: '00000',
        country: 'USA',
      };

      const result = service.estimateDistanceAndDuration(
        unknownAddress1,
        unknownAddress2,
      );

      expect(result.distance).toBe(500);
    });
  });
});
