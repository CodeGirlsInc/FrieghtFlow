import { Test, TestingModule } from '@nestjs/testing';
import { TrackingSystemController } from './tracking-system.controller';

describe('TrackingSystemController', () => {
  let controller: TrackingSystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackingSystemController],
    }).compile();

    controller = module.get<TrackingSystemController>(TrackingSystemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
