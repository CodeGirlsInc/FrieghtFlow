import { Injectable, Inject } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.cacheManager.set('health:ping', 'pong', 5000);
      await this.cacheManager.del('health:ping');
      return this.getStatus(key, true);
    } catch {
      throw new HealthCheckError(
        'Redis health check failed',
        this.getStatus(key, false),
      );
    }
  }
}
