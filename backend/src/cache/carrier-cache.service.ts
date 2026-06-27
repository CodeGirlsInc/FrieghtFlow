
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CarrierCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getCarriers<T = unknown>(query: unknown): Promise<T | null> {
    const cacheKey = this.getCacheKey(query);
    const cachedData = await this.cacheManager.get<T>(cacheKey);
    return cachedData ?? null;
  }

  async setCarriers<T = unknown>(query: unknown, data: T): Promise<void> {
    const cacheKey = this.getCacheKey(query);
    await this.cacheManager.set(cacheKey, data);
  }

  async invalidateCache(): Promise<void> {
    await this.cacheManager.clear();
  }

  private getCacheKey(query: unknown): string {
    return `carriers:${JSON.stringify(query)}`;
  }
}
