import { Test, TestingModule } from '@nestjs/testing';
import { CargoController } from './cargo.controller';
import { CargoService } from './cargo.service';

describe('CargoController', () => {
  let controller: CargoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CargoController],
      providers: [CargoService],
    }).compile();

    controller = module.get<CargoController>(CargoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
