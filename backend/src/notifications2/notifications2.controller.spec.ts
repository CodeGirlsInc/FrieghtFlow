import { Test, TestingModule } from '@nestjs/testing';
import { Notifications2Controller } from './notifications2.controller';

describe('Notifications2Controller', () => {
  let controller: Notifications2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Notifications2Controller],
    }).compile();

    controller = module.get<Notifications2Controller>(Notifications2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
