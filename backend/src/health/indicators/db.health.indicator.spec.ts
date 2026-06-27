import { Test, TestingModule } from '@nestjs/testing';
import { DbHealthIndicator } from './db.health.indicator';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';

describe('DbHealthIndicator', () => {
  let indicator: DbHealthIndicator;
  let typeOrmHealthIndicator: jest.Mocked<TypeOrmHealthIndicator>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DbHealthIndicator,
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
      ],
    }).compile();

    indicator = module.get<DbHealthIndicator>(DbHealthIndicator);
    typeOrmHealthIndicator = module.get(TypeOrmHealthIndicator);
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  it('should return healthy status when database is up', async () => {
    const mockResult = { database: { status: 'up' } };
    typeOrmHealthIndicator.pingCheck.mockResolvedValue(mockResult);

    const result = await indicator.isHealthy('database');

    expect(typeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith('database');
    expect(result).toEqual(mockResult);
  });

  it('should return down status when database is down', async () => {
    const mockError = new Error('Connection refused');
    typeOrmHealthIndicator.pingCheck.mockRejectedValue(mockError);

    await expect(indicator.isHealthy('database')).rejects.toThrow();
  });
});
