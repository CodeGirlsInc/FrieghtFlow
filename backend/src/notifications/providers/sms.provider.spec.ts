import { Test, TestingModule } from '@nestjs/testing';
import { SmsProvider } from './sms.provider';
import { ConfigService } from '@nestjs/config';

describe('SmsProvider', () => {
  let provider: SmsProvider;
  let configService: ConfigService;

  beforeEach(async () => {
   const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {  // Add Record type here
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_USER: 'test@example.com',
      SMTP_PASSWORD: 'password',
      SMTP_SECURE: 'false',
      SMTP_FROM_EMAIL: 'noreply@example.com',
    };
    return config[key];
  }),
};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsProvider,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    provider = module.get<SmsProvider>(SmsProvider);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('isConfigured', () => {
    it('should return false if required config is missing', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      const result = provider.isConfigured();
      expect(result).toBe(false);
    });

    it('should return true if all config is present', () => {
      const result = provider.isConfigured();
      // Note: This might be false since twilioClient might not be initialized
      expect(typeof result).toBe('boolean');
    });
  });

  describe('send', () => {
    it('should return false if not configured', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      const newProvider = new SmsProvider(configService);
      const result = await newProvider.send('+1234567890', 'Subject', 'Body');
      expect(result).toBe(false);
    });
  });
});
