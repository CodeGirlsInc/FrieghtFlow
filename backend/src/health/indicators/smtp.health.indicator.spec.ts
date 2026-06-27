import { Test, TestingModule } from '@nestjs/testing';
import { SmtpHealthIndicator } from './smtp.health.indicator';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('SmtpHealthIndicator', () => {
  let indicator: SmtpHealthIndicator;
  let configService: jest.Mocked<ConfigService>;
  let mockTransporter: { verify: jest.Mock };

  beforeEach(async () => {
    mockTransporter = {
      verify: jest.fn(),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmtpHealthIndicator,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    indicator = module.get<SmtpHealthIndicator>(SmtpHealthIndicator);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('should return healthy status when SMTP is up', async () => {
    configService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        MAIL_HOST: 'smtp.example.com',
        MAIL_PORT: 587,
        MAIL_USER: 'test@example.com',
        MAIL_PASS: 'password',
      };
      return config[key] ?? defaultValue;
    });

    mockTransporter.verify.mockResolvedValue(true);

    const result = await indicator.isHealthy('smtp');

    expect(result).toEqual({ smtp: { status: 'up' } });
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      auth: {
        user: 'test@example.com',
        pass: 'password',
      },
    });
    expect(mockTransporter.verify).toHaveBeenCalled();
  });

  it('should return down status when SMTP is down', async () => {
    configService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        MAIL_HOST: 'smtp.example.com',
        MAIL_PORT: 587,
        MAIL_USER: 'test@example.com',
        MAIL_PASS: 'password',
      };
      return config[key] ?? defaultValue;
    });

    mockTransporter.verify.mockRejectedValue(new Error('Connection refused'));

    const result = await indicator.isHealthy('smtp');

    expect(result).toEqual({
      smtp: {
        status: 'down',
        message: 'Connection refused',
      },
    });
  });

  it('should use default values when config is missing', async () => {
    configService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {};
      return config[key] ?? defaultValue;
    });

    mockTransporter.verify.mockResolvedValue(true);

    await indicator.isHealthy('smtp');

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: undefined,
        pass: undefined,
      },
    });
  });
});
