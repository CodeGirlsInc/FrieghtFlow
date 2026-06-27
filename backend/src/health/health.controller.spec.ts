import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService } from '@nestjs/terminus';
import { DbHealthIndicator } from './indicators/db.health.indicator';
import { SmtpHealthIndicator } from './indicators/smtp.health.indicator';
import { CloudinaryHealthIndicator } from './indicators/cloudinary.health.indicator';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;
  let dbHealthIndicator: jest.Mocked<DbHealthIndicator>;
  let smtpHealthIndicator: jest.Mocked<SmtpHealthIndicator>;
  let cloudinaryHealthIndicator: jest.Mocked<CloudinaryHealthIndicator>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(),
          },
        },
        {
          provide: DbHealthIndicator,
          useValue: {
            isHealthy: jest.fn(),
          },
        },
        {
          provide: SmtpHealthIndicator,
          useValue: {
            isHealthy: jest.fn(),
          },
        },
        {
          provide: CloudinaryHealthIndicator,
          useValue: {
            isHealthy: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get(HealthCheckService);
    dbHealthIndicator = module.get(DbHealthIndicator);
    smtpHealthIndicator = module.get(SmtpHealthIndicator);
    cloudinaryHealthIndicator = module.get(CloudinaryHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health status for all dependencies', async () => {
    const mockHealthResult = {
      status: 'ok',
      info: {
        database: { status: 'up' },
        smtp: { status: 'up' },
        cloudinary: { status: 'up' },
      },
    };

    dbHealthIndicator.isHealthy.mockResolvedValue({ database: { status: 'up' } });
    smtpHealthIndicator.isHealthy.mockResolvedValue({ smtp: { status: 'up' } });
    cloudinaryHealthIndicator.isHealthy.mockResolvedValue({ cloudinary: { status: 'up' } });
    healthCheckService.check.mockResolvedValue(mockHealthResult);

    const result = await controller.check();

    expect(healthCheckService.check).toHaveBeenCalled();
    expect(result).toEqual(mockHealthResult);
  });

  it('should handle partial failures', async () => {
    const mockHealthResult = {
      status: 'error',
      info: {
        database: { status: 'up' },
        smtp: { status: 'down', message: 'SMTP connection failed' },
        cloudinary: { status: 'up' },
      },
    };

    dbHealthIndicator.isHealthy.mockResolvedValue({ database: { status: 'up' } });
    smtpHealthIndicator.isHealthy.mockResolvedValue({ smtp: { status: 'down', message: 'SMTP connection failed' } });
    cloudinaryHealthIndicator.isHealthy.mockResolvedValue({ cloudinary: { status: 'up' } });
    healthCheckService.check.mockResolvedValue(mockHealthResult);

    const result = await controller.check();

    expect(healthCheckService.check).toHaveBeenCalled();
    expect(result).toEqual(mockHealthResult);
  });
});
