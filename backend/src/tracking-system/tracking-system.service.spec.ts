import { Test, TestingModule } from '@nestjs/testing';
import { TrackingSystemService } from './tracking-system.service';

describe('TrackingSystemService', () => {
  let service: TrackingSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackingSystemService],
    }).compile();

    service = module.get<TrackingSystemService>(TrackingSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
