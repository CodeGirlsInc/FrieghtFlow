import { Test, type TestingModule } from '@nestjs/testing';
import { CacheService } from '../services/cache.service';
import type { CacheConfig } from '../interfaces/cache.interface';

describe('CacheService', () => {
  let service: CacheService;
  let config: CacheConfig;

  beforeEach(async () => {
    config = {
      provider: 'memory',
      memory: {
        maxKeys: 1000,
        maxMemory: 10 * 1024 * 1024, // 10MB
        ttl: 3600,
        checkPeriod: 60000,
      },
      defaultTtl: 3600,
      namespace: 'test',
      compression: false,
      serialization: true,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CacheService,
          useFactory: () => new CacheService(config),
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  afterEach(async () => {
    await service.clear();
    await service.onModuleDestroy();
  });

  describe('basic operations', () => {
    it('should set and get a value', async () => {
      const key = 'test-key';
      const value = { message: 'Hello, World!' };

      const setResult = await service.set(key, value);
      expect(setResult).toBe(true);

      const getValue = await service.get(key);
      expect(getValue).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      const value = await service.get('non-existent-key');
      expect(value).toBeNull();
    });

    it('should delete a key', async () => {
      const key = 'delete-test';
      const value = 'test-value';

      await service.set(key, value);
      expect(await service.get(key)).toBe(value);

      const deleteResult = await service.del(key);
      expect(deleteResult).toBe(1);

      expect(await service.get(key)).toBeNull();
    });

    it('should check if key exists', async () => {
      const key = 'exists-test';
      const value = 'test-value';

      expect(await service.exists(key)).toBe(false);

      await service.set(key, value);
      expect(await service.exists(key)).toBe(true);

      await service.del(key);
      expect(await service.exists(key)).toBe(false);
    });
  });

  describe('TTL operations', () => {
    it('should set TTL and expire key', async () => {
      const key = 'ttl-test';
      const value = 'test-value';

      await service.set(key, value, { ttl: 1 }); // 1 second TTL

      expect(await service.get(key)).toBe(value);
      expect(await service.ttl(key)).toBeGreaterThan(0);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(await service.get(key)).toBeNull();
      expect(await service.ttl(key)).toBe(-2); // Key doesn't exist
    });

    it('should update TTL with expire', async () => {
      const key = 'expire-test';
      const value = 'test-value';

      await service.set(key, value);
      expect(await service.ttl(key)).toBe(-1); // No expiry

      const expireResult = await service.expire(key, 10);
      expect(expireResult).toBe(true);
      expect(await service.ttl(key)).toBeGreaterThan(0);
    });
  });

  describe('namespace operations', () => {
    it('should handle namespaced keys', async () => {
      const key = 'namespaced-key';
      const value1 = 'value1';
      const value2 = 'value2';

      await service.set(key, value1, { namespace: 'ns1' });
      await service.set(key, value2, { namespace: 'ns2' });

      expect(await service.get(key, { namespace: 'ns1' })).toBe(value1);
      expect(await service.get(key, { namespace: 'ns2' })).toBe(value2);
    });

    it('should clear namespace', async () => {
      await service.set('key1', 'value1', { namespace: 'clear-test' });
      await service.set('key2', 'value2', { namespace: 'clear-test' });
      await service.set('key3', 'value3', { namespace: 'other' });

      expect(await service.get('key1', { namespace: 'clear-test' })).toBe(
        'value1',
      );
      expect(await service.get('key3', { namespace: 'other' })).toBe('value3');

      await service.clear('clear-test');

      expect(await service.get('key1', { namespace: 'clear-test' })).toBeNull();
      expect(await service.get('key2', { namespace: 'clear-test' })).toBeNull();
      expect(await service.get('key3', { namespace: 'other' })).toBe('value3');
    });
  });

  describe('pattern matching', () => {
    it('should find keys by pattern', async () => {
      await service.set('user:1', 'user1');
      await service.set('user:2', 'user2');
      await service.set('order:1', 'order1');

      const userKeys = await service.keys('user:*');
      expect(userKeys).toHaveLength(2);
      expect(userKeys).toContain('user:1');
      expect(userKeys).toContain('user:2');

      const allKeys = await service.keys('*');
      expect(allKeys).toHaveLength(3);
    });
  });

  describe('statistics', () => {
    it('should return cache statistics', async () => {
      await service.set('stat-key1', 'value1');
      await service.set('stat-key2', 'value2');

      // Generate some hits and misses
      await service.get('stat-key1'); // hit
      await service.get('stat-key2'); // hit
      await service.get('non-existent'); // miss

      const stats = await service.getStats();

      expect(stats.keys).toBeGreaterThanOrEqual(2);
      expect(stats.hits).toBeGreaterThanOrEqual(2);
      expect(stats.misses).toBeGreaterThanOrEqual(1);
      expect(stats.hitRate).toBeGreaterThan(0);
    });
  });

  describe('health check', () => {
    it('should report healthy status', async () => {
      const isHealthy = await service.isHealthy();
      expect(isHealthy).toBe(true);
    });
  });

  describe('provider info', () => {
    it('should return provider information', () => {
      const info = service.getProviderInfo();
      expect(info.primary).toBe('memory');
      expect(info.usingFallback).toBe(false);
    });
  });
});
