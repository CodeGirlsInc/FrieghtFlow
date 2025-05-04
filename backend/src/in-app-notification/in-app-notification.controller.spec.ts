import { Test, TestingModule } from '@nestjs/testing';
import { InAppNotificationController } from './in-app-notification.controller';
import { InAppNotificationService } from './in-app-notification.service';

describe('InAppNotificationController', () => {
  let controller: InAppNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InAppNotificationController],
      providers: [InAppNotificationService],
    }).compile();

    controller = module.get<InAppNotificationController>(InAppNotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
