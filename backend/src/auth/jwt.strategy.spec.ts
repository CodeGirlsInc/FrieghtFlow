import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: JwtStrategy,
          useValue: {
            validate: jest
              .fn()
              .mockResolvedValue({ userId: 1, email: 'test@example.com' }),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should validate payload', async () => {
    const result = await strategy.validate({
      sub: 1,
      email: 'test@example.com',
    });
    expect(result.userId).toEqual(1);
  });
});
