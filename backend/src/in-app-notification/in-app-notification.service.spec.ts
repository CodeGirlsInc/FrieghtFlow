import { Test, TestingModule } from '@nestjs/testing';
import { InAppNotificationService } from './in-app-notification.service';

describe('InAppNotificationService', () => {
  let service: InAppNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InAppNotificationService],
    }).compile();

    service = module.get<InAppNotificationService>(InAppNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
