import { Test, TestingModule } from '@nestjs/testing';
import { StellarFreightService } from './stellar-freight.service';

describe('StellarFreightService', () => {
  let service: StellarFreightService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StellarFreightService],
    }).compile();

    service = module.get<StellarFreightService>(StellarFreightService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
