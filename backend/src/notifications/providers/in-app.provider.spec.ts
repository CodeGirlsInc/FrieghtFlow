import { Test, TestingModule } from '@nestjs/testing';
import { InAppProvider } from './in-app.provider';

describe('InAppProvider', () => {
  let provider: InAppProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InAppProvider],
    }).compile();

    provider = module.get<InAppProvider>(InAppProvider);
  });

  describe('isConfigured', () => {
    it('should always return true', () => {
      const result = provider.isConfigured();
      expect(result).toBe(true);
    });
  });

  describe('send', () => {
    it('should return true on successful send', async () => {
      const result = await provider.send('user-id', 'Subject', 'Body');
      expect(result).toBe(true);
    });
  });
});
