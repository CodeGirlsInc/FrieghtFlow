import { Injectable, Logger } from '@nestjs/common';
import type {
  CacheProvider,
  CacheSetOptions,
  CacheGetOptions,
  CacheStats,
  CacheConfig,
} from '../interfaces/cache.interface';

// Mock Redis client interface
interface MockRedisClient {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    mode?: string,
    duration?: number,
  ): Promise<string | null>;
  setex(key: string, seconds: number, value: string): Promise<string>;
  del(...keys: string[]): Promise<number>;
  exists(...keys: string[]): Promise<number>;
  ttl(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  flushdb(): Promise<string>;
  info(section?: string): Promise<string>;
  ping(): Promise<string>;
  quit(): Promise<string>;
  on(event: string, callback: (...args: any[]) => void): void;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

@Injectable()
export class RedisCacheProvider implements CacheProvider {
  private readonly logger = new Logger(RedisCacheProvider.name);
  private client: MockRedisClient;
  private isConnected = false;
  private stats = {
    hits: 0,
    misses: 0,
    operations: 0,
  };

  constructor(private readonly config: CacheConfig) {
    this.initializeClient();
  }

  private initializeClient(): void {
    // Mock Redis client implementation
    this.client = this.createMockRedisClient();
    this.setupEventHandlers();
    this.connect();
  }

  private createMockRedisClient(): MockRedisClient {
    const storage = new Map<string, { value: string; expiry?: number }>();

    const checkExpiry = (key: string): boolean => {
      const item = storage.get(key);
      if (item && item.expiry && Date.now() > item.expiry) {
        storage.delete(key);
        return false;
      }
      return !!item;
    };

    return {
      async get(key: string): Promise<string | null> {
        if (checkExpiry(key)) {
          const item = storage.get(key);
          return item?.value || null;
        }
        return null;
      },

      async set(
        key: string,
        value: string,
        mode?: string,
        duration?: number,
      ): Promise<string | null> {
        if (mode === 'NX' && storage.has(key)) {
          return null; // Key already exists
        }

        const expiry = duration ? Date.now() + duration * 1000 : undefined;
        storage.set(key, { value, expiry });
        return 'OK';
      },

      async setex(
        key: string,
        seconds: number,
        value: string,
      ): Promise<string> {
        const expiry = Date.now() + seconds * 1000;
        storage.set(key, { value, expiry });
        return 'OK';
      },

      async del(...keys: string[]): Promise<number> {
        let deleted = 0;
        for (const key of keys) {
          if (storage.delete(key)) {
            deleted++;
          }
        }
        return deleted;
      },

      async exists(...keys: string[]): Promise<number> {
        let count = 0;
        for (const key of keys) {
          if (checkExpiry(key)) {
            count++;
          }
        }
        return count;
      },

      async ttl(key: string): Promise<number> {
        const item = storage.get(key);
        if (!item) return -2; // Key doesn't exist
        if (!item.expiry) return -1; // Key exists but has no expiry

        const remaining = Math.ceil((item.expiry - Date.now()) / 1000);
        return remaining > 0 ? remaining : -2;
      },

      async expire(key: string, seconds: number): Promise<number> {
        const item = storage.get(key);
        if (!item) return 0;

        item.expiry = Date.now() + seconds * 1000;
        storage.set(key, item);
        return 1;
      },

      async keys(pattern: string): Promise<string[]> {
        const regex = new RegExp(
          pattern.replace(/\*/g, '.*').replace(/\?/g, '.'),
        );
        const matchingKeys: string[] = [];

        for (const key of storage.keys()) {
          if (checkExpiry(key) && regex.test(key)) {
            matchingKeys.push(key);
          }
        }

        return matchingKeys;
      },

      async flushdb(): Promise<string> {
        storage.clear();
        return 'OK';
      },

      async info(section?: string): Promise<string> {
        return `# Memory\nused_memory:${storage.size * 100}\nused_memory_human:${((storage.size * 100) / 1024).toFixed(2)}K\n# Stats\nkeyspace_hits:${this.stats.hits}\nkeyspace_misses:${this.stats.misses}`;
      },

      async ping(): Promise<string> {
        return 'PONG';
      },

      async quit(): Promise<string> {
        return 'OK';
      },

      on(event: string, callback: (...args: any[]) => void): void {
        // Mock event handling
        if (event === 'connect') {
          setTimeout(() => callback(), 100);
        }
      },

      async connect(): Promise<void> {
        // Mock connection
        await new Promise((resolve) => setTimeout(resolve, 50));
      },

      async disconnect(): Promise<void> {
        // Mock disconnection
        await new Promise((resolve) => setTimeout(resolve, 10));
      },
    };
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Connected to Redis (mocked)');
    });

    this.client.on('error', (error: Error) => {
      this.logger.error('Redis connection error (mocked):', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed (mocked)');
      this.isConnected = false;
    });
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.logger.log('Redis client connected (mocked)');
    } catch (error) {
      this.logger.error('Failed to connect to Redis (mocked):', error);
      throw error;
    }
  }

  private buildKey(key: string, namespace?: string): string {
    const ns = namespace || this.config.namespace || 'cache';
    const prefix = this.config.redis?.keyPrefix || '';
    return `${prefix}${ns}:${key}`;
  }

  private serialize(value: any): string {
    if (this.config.serialization === false) {
      return String(value);
    }
    return JSON.stringify(value);
  }

  private deserialize<T>(value: string): T {
    if (this.config.serialization === false) {
      return value as T;
    }
    try {
      return JSON.parse(value);
    } catch {
      return value as T;
    }
  }

  async get<T = any>(
    key: string,
    options?: CacheGetOptions,
  ): Promise<T | null> {
    try {
      this.stats.operations++;
      const fullKey = this.buildKey(key, options?.namespace);
      const value = await this.client.get(fullKey);

      if (value === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return this.deserialize<T>(value);
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error);
      this.stats.misses++;
      return null;
    }
  }

  async set<T = any>(
    key: string,
    value: T,
    options?: CacheSetOptions,
  ): Promise<boolean> {
    try {
      this.stats.operations++;
      const fullKey = this.buildKey(key, options?.namespace);
      const serializedValue = this.serialize(value);
      const ttl = options?.ttl || options?.ex || this.config.defaultTtl;

      let result: string | null;

      if (options?.nx) {
        result = await this.client.set(fullKey, serializedValue, 'NX', ttl);
      } else if (ttl) {
        result = await this.client.setex(fullKey, ttl, serializedValue);
      } else {
        result = await this.client.set(fullKey, serializedValue);
      }

      return result === 'OK';
    } catch (error) {
      this.logger.error(`Failed to set key ${key}:`, error);
      return false;
    }
  }

  async del(key: string | string[], namespace?: string): Promise<number> {
    try {
      this.stats.operations++;
      const keys = Array.isArray(key) ? key : [key];
      const fullKeys = keys.map((k) => this.buildKey(k, namespace));
      return await this.client.del(...fullKeys);
    } catch (error) {
      this.logger.error(`Failed to delete keys:`, error);
      return 0;
    }
  }

  async exists(key: string, namespace?: string): Promise<boolean> {
    try {
      this.stats.operations++;
      const fullKey = this.buildKey(key, namespace);
      const result = await this.client.exists(fullKey);
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to check existence of key ${key}:`, error);
      return false;
    }
  }

  async ttl(key: string, namespace?: string): Promise<number> {
    try {
      this.stats.operations++;
      const fullKey = this.buildKey(key, namespace);
      return await this.client.ttl(fullKey);
    } catch (error) {
      this.logger.error(`Failed to get TTL for key ${key}:`, error);
      return -2;
    }
  }

  async expire(
    key: string,
    seconds: number,
    namespace?: string,
  ): Promise<boolean> {
    try {
      this.stats.operations++;
      const fullKey = this.buildKey(key, namespace);
      const result = await this.client.expire(fullKey, seconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to set expiry for key ${key}:`, error);
      return false;
    }
  }

  async keys(pattern: string, namespace?: string): Promise<string[]> {
    try {
      this.stats.operations++;
      const fullPattern = this.buildKey(pattern, namespace);
      const keys = await this.client.keys(fullPattern);

      // Remove namespace prefix from returned keys
      const prefix = this.buildKey('', namespace);
      return keys.map((key) => key.replace(prefix, ''));
    } catch (error) {
      this.logger.error(`Failed to get keys with pattern ${pattern}:`, error);
      return [];
    }
  }

  async clear(namespace?: string): Promise<boolean> {
    try {
      this.stats.operations++;
      const pattern = this.buildKey('*', namespace);
      const keys = await this.client.keys(pattern);

      if (keys.length > 0) {
        await this.client.del(...keys);
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to clear cache:`, error);
      return false;
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      const info = await this.client.info('memory');
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const memory = memoryMatch ? Number.parseInt(memoryMatch[1]) : 0;

      const hitRate =
        this.stats.operations > 0
          ? (this.stats.hits / this.stats.operations) * 100
          : 0;

      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        keys: await this.getKeyCount(),
        memory,
        hitRate: Math.round(hitRate * 100) / 100,
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        keys: 0,
        memory: 0,
        hitRate: 0,
      };
    }
  }

  private async getKeyCount(): Promise<number> {
    try {
      const keys = await this.client.keys('*');
      return keys.length;
    } catch {
      return 0;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.client.ping();
      return response === 'PONG' && this.isConnected;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
      this.logger.log('Disconnected from Redis (mocked)');
    } catch (error) {
      this.logger.error('Error disconnecting from Redis (mocked):', error);
    }
  }
}
