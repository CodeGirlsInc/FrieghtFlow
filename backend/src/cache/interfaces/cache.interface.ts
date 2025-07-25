export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
  compress?: boolean;
  serialize?: boolean;
}

export interface CacheSetOptions extends CacheOptions {
  nx?: boolean; // Only set if key doesn't exist
  ex?: number; // Expiration time in seconds
}

export interface CacheGetOptions {
  namespace?: string;
  decompress?: boolean;
  deserialize?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory?: number;
  hitRate: number;
}

export interface CacheProvider {
  get<T = any>(key: string, options?: CacheGetOptions): Promise<T | null>;
  set<T = any>(
    key: string,
    value: T,
    options?: CacheSetOptions,
  ): Promise<boolean>;
  del(key: string | string[], namespace?: string): Promise<number>;
  exists(key: string, namespace?: string): Promise<boolean>;
  ttl(key: string, namespace?: string): Promise<number>;
  expire(key: string, seconds: number, namespace?: string): Promise<boolean>;
  keys(pattern: string, namespace?: string): Promise<string[]>;
  clear(namespace?: string): Promise<boolean>;
  getStats(): Promise<CacheStats>;
  isHealthy(): Promise<boolean>;
}

export interface CacheConfig {
  provider: 'redis' | 'memory';
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    retryAttempts?: number;
    retryDelay?: number;
    maxRetriesPerRequest?: number;
    lazyConnect?: boolean;
    keepAlive?: number;
    family?: number;
    connectTimeout?: number;
    commandTimeout?: number;
  };
  memory?: {
    maxKeys?: number;
    maxMemory?: number;
    ttl?: number;
    checkPeriod?: number;
  };
  defaultTtl?: number;
  namespace?: string;
  compression?: boolean;
  serialization?: boolean;
}
