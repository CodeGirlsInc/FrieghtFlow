import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import type {
  CacheProvider,
  CacheSetOptions,
  CacheGetOptions,
  CacheStats,
  CacheConfig,
} from '../interfaces/cache.interface';
import { RedisCacheProvider } from '../providers/redis-cache.provider';
import { MemoryCacheProvider } from '../providers/memory-cache.provider';

@Injectable()
export class CacheService implements CacheProvider, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private primaryProvider: CacheProvider;
  private fallbackProvider: CacheProvider;
  private useFallback = false;

  constructor(private readonly config: CacheConfig) {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    try {
      // Initialize primary provider
      if (this.config.provider === 'redis') {
        this.primaryProvider = new RedisCacheProvider(this.config);
        this.fallbackProvider = new MemoryCacheProvider(this.config);
        this.logger.log('Initialized Redis cache with memory fallback');
      } else {
        this.primaryProvider = new MemoryCacheProvider(this.config);
        this.logger.log('Initialized memory cache');
      }

      // Check primary provider health periodically
      if (this.fallbackProvider) {
        this.startHealthCheck();
      }
    } catch (error) {
      this.logger.error('Failed to initialize cache providers:', error);
      throw error;
    }
  }

  private startHealthCheck(): void {
    setInterval(async () => {
      const isHealthy = await this.primaryProvider.isHealthy();

      if (!isHealthy && !this.useFallback) {
        this.logger.warn(
          'Primary cache provider is unhealthy, switching to fallback',
        );
        this.useFallback = true;
      } else if (isHealthy && this.useFallback) {
        this.logger.log(
          'Primary cache provider is healthy again, switching back',
        );
        this.useFallback = false;
      }
    }, 30000); // Check every 30 seconds
  }

  private getActiveProvider(): CacheProvider {
    return this.useFallback && this.fallbackProvider
      ? this.fallbackProvider
      : this.primaryProvider;
  }

  async get<T = any>(
    key: string,
    options?: CacheGetOptions,
  ): Promise<T | null> {
    try {
      return await this.getActiveProvider().get<T>(key, options);
    } catch (error) {
      this.logger.error(`Cache get failed for key ${key}:`, error);

      // Try fallback if available and not already using it
      if (this.fallbackProvider && !this.useFallback) {
        try {
          return await this.fallbackProvider.get<T>(key, options);
        } catch (fallbackError) {
          this.logger.error(
            `Fallback cache get failed for key ${key}:`,
            fallbackError,
          );
        }
      }

      return null;
    }
  }

  async set<T = any>(
    key: string,
    value: T,
    options?: CacheSetOptions,
  ): Promise<boolean> {
    try {
      const result = await this.getActiveProvider().set(key, value, options);

      // Also set in fallback if available and primary succeeded
      if (result && this.fallbackProvider && !this.useFallback) {
        try {
          await this.fallbackProvider.set(key, value, options);
        } catch (error) {
          this.logger.warn(
            `Failed to sync to fallback cache for key ${key}:`,
            error,
          );
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Cache set failed for key ${key}:`, error);

      // Try fallback if available and not already using it
      if (this.fallbackProvider && !this.useFallback) {
        try {
          return await this.fallbackProvider.set(key, value, options);
        } catch (fallbackError) {
          this.logger.error(
            `Fallback cache set failed for key ${key}:`,
            fallbackError,
          );
        }
      }

      return false;
    }
  }

  async del(key: string | string[], namespace?: string): Promise<number> {
    try {
      const result = await this.getActiveProvider().del(key, namespace);

      // Also delete from fallback if available
      if (this.fallbackProvider && !this.useFallback) {
        try {
          await this.fallbackProvider.del(key, namespace);
        } catch (error) {
          this.logger.warn(`Failed to delete from fallback cache:`, error);
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Cache delete failed:`, error);
      return 0;
    }
  }

  async exists(key: string, namespace?: string): Promise<boolean> {
    try {
      return await this.getActiveProvider().exists(key, namespace);
    } catch (error) {
      this.logger.error(`Cache exists check failed for key ${key}:`, error);
      return false;
    }
  }

  async ttl(key: string, namespace?: string): Promise<number> {
    try {
      return await this.getActiveProvider().ttl(key, namespace);
    } catch (error) {
      this.logger.error(`Cache TTL check failed for key ${key}:`, error);
      return -2;
    }
  }

  async expire(
    key: string,
    seconds: number,
    namespace?: string,
  ): Promise<boolean> {
    try {
      const result = await this.getActiveProvider().expire(
        key,
        seconds,
        namespace,
      );

      // Also expire in fallback if available
      if (this.fallbackProvider && !this.useFallback) {
        try {
          await this.fallbackProvider.expire(key, seconds, namespace);
        } catch (error) {
          this.logger.warn(
            `Failed to set expiry in fallback cache for key ${key}:`,
            error,
          );
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Cache expire failed for key ${key}:`, error);
      return false;
    }
  }

  async keys(pattern: string, namespace?: string): Promise<string[]> {
    try {
      return await this.getActiveProvider().keys(pattern, namespace);
    } catch (error) {
      this.logger.error(
        `Cache keys search failed for pattern ${pattern}:`,
        error,
      );
      return [];
    }
  }

  async clear(namespace?: string): Promise<boolean> {
    try {
      const result = await this.getActiveProvider().clear(namespace);

      // Also clear fallback if available
      if (this.fallbackProvider && !this.useFallback) {
        try {
          await this.fallbackProvider.clear(namespace);
        } catch (error) {
          this.logger.warn(`Failed to clear fallback cache:`, error);
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Cache clear failed:`, error);
      return false;
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      return await this.getActiveProvider().getStats();
    } catch (error) {
      this.logger.error(`Failed to get cache stats:`, error);
      return {
        hits: 0,
        misses: 0,
        keys: 0,
        memory: 0,
        hitRate: 0,
      };
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      return await this.getActiveProvider().isHealthy();
    } catch (error) {
      this.logger.error(`Health check failed:`, error);
      return false;
    }
  }

  getProviderInfo(): {
    primary: string;
    fallback?: string;
    usingFallback: boolean;
  } {
    return {
      primary: this.config.provider,
      fallback: this.fallbackProvider ? 'memory' : undefined,
      usingFallback: this.useFallback,
    };
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.primaryProvider && 'disconnect' in this.primaryProvider) {
        await (this.primaryProvider as any).disconnect();
      }

      if (this.fallbackProvider && 'destroy' in this.fallbackProvider) {
        (this.fallbackProvider as any).destroy();
      }

      this.logger.log('Cache service destroyed');
    } catch (error) {
      this.logger.error('Error during cache service destruction:', error);
    }
  }
}
