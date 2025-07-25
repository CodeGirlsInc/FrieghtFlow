import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './services/cache.service';
import { ShipmentCacheService } from './services/shipment-cache.service';
import { CacheController } from './controllers/cache.controller';
import { ShipmentCacheController } from './controllers/shipment-cache.controller';
import type { CacheConfig } from './interfaces/cache.interface';
import { RolesModule } from '../roles/roles.module';

@Global()
@Module({
  imports: [ConfigModule, RolesModule],
  controllers: [CacheController, ShipmentCacheController],
  providers: [
    {
      provide: 'CACHE_CONFIG',
      useFactory: (configService: ConfigService): CacheConfig => ({
        provider: configService.get<'redis' | 'memory'>(
          'CACHE_PROVIDER',
          'memory',
        ),
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
          keyPrefix: configService.get<string>('REDIS_KEY_PREFIX', 'app:'),
          retryAttempts: configService.get<number>('REDIS_RETRY_ATTEMPTS', 3),
          retryDelay: configService.get<number>('REDIS_RETRY_DELAY', 1000),
          maxRetriesPerRequest: configService.get<number>(
            'REDIS_MAX_RETRIES',
            3,
          ),
          lazyConnect: configService.get<boolean>('REDIS_LAZY_CONNECT', true),
          keepAlive: configService.get<number>('REDIS_KEEP_ALIVE', 30000),
          family: configService.get<number>('REDIS_FAMILY', 4),
          connectTimeout: configService.get<number>(
            'REDIS_CONNECT_TIMEOUT',
            10000,
          ),
          commandTimeout: configService.get<number>(
            'REDIS_COMMAND_TIMEOUT',
            5000,
          ),
        },
        memory: {
          maxKeys: configService.get<number>('MEMORY_CACHE_MAX_KEYS', 10000),
          maxMemory: configService.get<number>(
            'MEMORY_CACHE_MAX_MEMORY',
            100 * 1024 * 1024,
          ), // 100MB
          ttl: configService.get<number>('MEMORY_CACHE_TTL', 3600),
          checkPeriod: configService.get<number>(
            'MEMORY_CACHE_CHECK_PERIOD',
            60000,
          ),
        },
        defaultTtl: configService.get<number>('CACHE_DEFAULT_TTL', 3600),
        namespace: configService.get<string>('CACHE_NAMESPACE', 'app'),
        compression: configService.get<boolean>('CACHE_COMPRESSION', false),
        serialization: configService.get<boolean>('CACHE_SERIALIZATION', true),
      }),
      inject: [ConfigService],
    },
    {
      provide: CacheService,
      useFactory: (config: CacheConfig) => new CacheService(config),
      inject: ['CACHE_CONFIG'],
    },
    ShipmentCacheService,
  ],
  exports: [CacheService, ShipmentCacheService],
})
export class CacheModule {}
