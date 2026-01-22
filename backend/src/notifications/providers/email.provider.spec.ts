import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailProvider } from './email.provider';

describe('EmailProvider', () => {
  let provider: EmailProvider;
  let configService: ConfigService;

  beforeEach(async () => {
const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {  // Add Record type here
      TWILIO_ACCOUNT_SID: 'test-sid',
      TWILIO_AUTH_TOKEN: 'test-token',
      TWILIO_PHONE_NUMBER: '+1234567890',
    };
    return config[key];
  }),
};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProvider,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    provider = module.get<EmailProvider>(EmailProvider);
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
      expect(result).toBe(true);
    });
  });

  describe('send', () => {
    it('should return false if not configured', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      const newProvider = new EmailProvider(configService);
      const result = await newProvider.send('test@example.com', 'Subject', 'Body');
      expect(result).toBe(false);
    });
  });
});
