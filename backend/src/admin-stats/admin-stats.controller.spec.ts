import { Test, TestingModule } from '@nestjs/testing';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('AdminStatsController', () => {
  let controller: AdminStatsController;
  let service: AdminStatsService;

  const mockAdminStatsService = {
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminStatsController],
      providers: [
        { provide: AdminStatsService, useValue: mockAdminStatsService },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminStatsController>(AdminStatsController);
    service = module.get<AdminStatsService>(AdminStatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    it('should call the admin stats service', async () => {
      await controller.getStats();
      expect(service.getStats).toHaveBeenCalled();
    });
  });
});
