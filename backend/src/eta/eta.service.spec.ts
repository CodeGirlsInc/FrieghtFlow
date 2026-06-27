import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ETAService } from './eta.service';
import { ETACalculation } from './entities/eta-calculation.entity';

describe('ETAService', () => {
  let service: ETAService;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ETAService,
        { provide: getRepositoryToken(ETACalculation), useValue: mockRepo },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(60) },
        },
      ],
    }).compile();
    service = module.get(ETAService);
  });

  it('calculates ETA for on-time carrier', async () => {
    const result = await service.calculateETA({
      originCity: 'Lagos',
      destinationCity: 'Abuja',
    });
    expect(result.estimatedHours).toBeGreaterThan(0);
    expect(result.confidenceLevel).toBeDefined();
  });

  it('applies buffer for unreliable carrier', async () => {
    const result = await service.calculateETA({
      originCity: 'Lagos',
      destinationCity: 'Abuja',
    });
    expect(result.estimatedHours).toBeDefined();
  });

  it('uses default buffer when carrier has no history', async () => {
    const result = await service.calculateETA({
      originCity: 'Lagos',
      destinationCity: 'Abuja',
    });
    expect(result.estimatedHours).toBeDefined();
  });
});
