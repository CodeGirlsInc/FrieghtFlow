
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CarrierCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getCarriers(query: any): Promise<User[] | null> {
    const cacheKey = this.getCacheKey(query);
    const cachedData = await this.cacheManager.get<User[]>(cacheKey);
    return cachedData || null;
  }

  async setCarriers(query: any, data: User[]): Promise<void> {
    const cacheKey = this.getCacheKey(query);
    await this.cacheManager.set(cacheKey, data);
  }

  async invalidateCache(): Promise<void> {
    // Invalidate all carrier caches
    const keys = await this.cacheManager.store.keys('carriers:*');
    for (const key of keys) {
      await this.cacheManager.del(key);
    }
  }

  private getCacheKey(query: any): string {
    return `carriers:${JSON.stringify(query)}`;
  }
}