import { Test, TestingModule } from '@nestjs/testing';
import { RouteCalculatorService } from './route-calculator.service';

describe('RouteCalculatorService', () => {
  let service: RouteCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RouteCalculatorService],
    }).compile();

    service = module.get<RouteCalculatorService>(RouteCalculatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateDistance', () => {
    it('should calculate the distance between two points correctly', () => {
      // Coordinates for New York (JFK) and Los Angeles (LAX)
      const jfkCoords: [number, number] = [40.6413, -73.7781];
      const laxCoords: [number, number] = [33.9416, -118.4085];
      const expectedDistance = 3972; // in kilometers

      const distance = service.calculateDistance(jfkCoords, laxCoords);
      expect(distance).toBeCloseTo(expectedDistance, 0);
    });

    it('should return 0 for the same coordinates', () => {
      const coords: [number, number] = [51.5074, -0.1278]; // London
      const distance = service.calculateDistance(coords, coords);
      expect(distance).toBe(0);
    });
  });

  describe('estimateDuration', () => {
    it('should estimate the duration correctly', () => {
      const distance = 1000;
      const avgSpeed = 80;
      const expectedDuration = 12.5;

      const duration = service.estimateDuration(distance, avgSpeed);
      expect(duration).toBe(expectedDuration);
    });
  });

  describe('estimateCarbonFootprint', () => {
    it('should estimate the carbon footprint correctly', () => {
      const distance = 1000;
      const weight = 10;
      const expectedFootprint = 1000; // 1000 * 10 * 0.1

      const footprint = service.estimateCarbonFootprint(distance, weight);
      expect(footprint).toBe(expectedFootprint);
    });
  });
});
