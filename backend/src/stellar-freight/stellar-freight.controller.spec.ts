import { Test, TestingModule } from '@nestjs/testing';
import { StellarFreightController } from './stellar-freight.controller';
import { StellarFreightService } from './stellar-freight.service';

describe('StellarFreightController', () => {
  let controller: StellarFreightController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StellarFreightController],
      providers: [StellarFreightService],
    }).compile();

    controller = module.get<StellarFreightController>(StellarFreightController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
