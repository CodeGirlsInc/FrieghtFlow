import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryHealthIndicator } from './cloudinary.health.indicator';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

jest.mock('cloudinary');

describe('CloudinaryHealthIndicator', () => {
  let indicator: CloudinaryHealthIndicator;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryHealthIndicator,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    indicator = module.get<CloudinaryHealthIndicator>(
      CloudinaryHealthIndicator,
    );
    configService = module.get(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('should configure cloudinary on initialization', () => {
    configService.get.mockImplementation((key: string) => {
      const config: Record<string, string> = {
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };
      return config[key];
    });

    new CloudinaryHealthIndicator(configService);

    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    });
  });

  it('should return healthy status when Cloudinary is up', async () => {
    configService.get.mockImplementation((key: string) => {
      const config: Record<string, string> = {
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };
      return config[key];
    });

    (cloudinary.api.ping as jest.Mock).mockResolvedValue({ status: 'ok' });

    const result = await indicator.isHealthy('cloudinary');

    expect(result).toEqual({ cloudinary: { status: 'up' } });
    expect(cloudinary.api.ping).toHaveBeenCalled();
  });

  it('should return down status when Cloudinary ping returns unexpected status', async () => {
    configService.get.mockImplementation((key: string) => {
      const config: Record<string, string> = {
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };
      return config[key];
    });

    (cloudinary.api.ping as jest.Mock).mockResolvedValue({ status: 'error' });

    const result = await indicator.isHealthy('cloudinary');

    expect(result).toEqual({
      cloudinary: {
        status: 'down',
        message: 'Cloudinary ping returned unexpected status',
      },
    });
  });

  it('should return down status when Cloudinary connection fails', async () => {
    configService.get.mockImplementation((key: string) => {
      const config: Record<string, string> = {
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };
      return config[key];
    });

    (cloudinary.api.ping as jest.Mock).mockRejectedValue(
      new Error('API Error'),
    );

    const result = await indicator.isHealthy('cloudinary');

    expect(result).toEqual({
      cloudinary: {
        status: 'down',
        message: 'API Error',
      },
    });
  });
});
