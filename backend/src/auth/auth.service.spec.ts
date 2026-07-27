import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest
              .fn()
              .mockResolvedValue({ id: 1, email: 'test@example.com' }),
            login: jest.fn().mockResolvedValue({ access_token: 'jwt-token' }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user correctly', async () => {
    const user = await service.validateUser('test@example.com', 'password');
    expect(user.email).toEqual('test@example.com');
  });
});
