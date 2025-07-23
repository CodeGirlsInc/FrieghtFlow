import { Injectable, Logger } from "@nestjs/common"
import type {
  CacheProvider,
  CacheSetOptions,
  CacheGetOptions,
  CacheStats,
  CacheConfig,
} from "../interfaces/cache.interface"

interface CacheItem<T = any> {
  value: T
  expiry?: number
  createdAt: number
  accessCount: number
  lastAccessed: number
}

@Injectable()
export class MemoryCacheProvider implements CacheProvider {
  private readonly logger = new Logger(MemoryCacheProvider.name)
  private readonly storage = new Map<string, CacheItem>()
  private readonly stats = {
    hits: 0,
    misses: 0,
    operations: 0,
    evictions: 0,
  }
  private cleanupInterval: NodeJS.Timeout

  constructor(private readonly config: CacheConfig) {
    this.startCleanupProcess()
    this.logger.log("Memory cache provider initialized")
  }

  private startCleanupProcess(): void {
    const checkPeriod = this.config.memory?.checkPeriod || 60000 // 1 minute

    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, checkPeriod)
  }

  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, item] of this.storage.entries()) {
      if (item.expiry && now > item.expiry) {
        this.storage.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired cache entries`)
    }

    // Check memory limits
    this.enforceMemoryLimits()
  }

  private enforceMemoryLimits(): void {
    const maxKeys = this.config.memory?.maxKeys
    const maxMemory = this.config.memory?.maxMemory

    if (maxKeys && this.storage.size > maxKeys) {
      this.evictLeastRecentlyUsed(this.storage.size - maxKeys)
    }

    if (maxMemory) {
      const currentMemory = this.getMemoryUsage()
      if (currentMemory > maxMemory) {
        // Evict 10% of entries to free up memory
        const toEvict = Math.ceil(this.storage.size * 0.1)
        this.evictLeastRecentlyUsed(toEvict)
      }
    }
  }

  private evictLeastRecentlyUsed(count: number): void {
    const entries = Array.from(this.storage.entries())
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)

    for (let i = 0; i < count && i < entries.length; i++) {
      this.storage.delete(entries[i][0])
      this.stats.evictions++
    }

    this.logger.debug(`Evicted ${count} least recently used cache entries`)
  }

  private getMemoryUsage(): number {
    // Rough estimation of memory usage
    let size = 0
    for (const [key, item] of this.storage.entries()) {
      size += key.length * 2 // UTF-16 characters
      size += JSON.stringify(item.value).length * 2
      size += 64 // Overhead for item metadata
    }
    return size
  }

  private buildKey(key: string, namespace?: string): string {
    const ns = namespace || this.config.namespace || "cache"
    return `${ns}:${key}`
  }

  private isExpired(item: CacheItem): boolean {
    return item.expiry ? Date.now() > item.expiry : false
  }

  async get<T = any>(key: string, options?: CacheGetOptions): Promise<T | null> {
    this.stats.operations++
    const fullKey = this.buildKey(key, options?.namespace)
    const item = this.storage.get(fullKey)

    if (!item || this.isExpired(item)) {
      if (item && this.isExpired(item)) {
        this.storage.delete(fullKey)
      }
      this.stats.misses++
      return null
    }

    // Update access statistics
    item.accessCount++
    item.lastAccessed = Date.now()
    this.stats.hits++

    return item.value as T
  }

  async set<T = any>(key: string, value: T, options?: CacheSetOptions): Promise<boolean> {
    this.stats.operations++
    const fullKey = this.buildKey(key, options?.namespace)

    // Check if key exists and NX option is set
    if (options?.nx && this.storage.has(fullKey)) {
      const existingItem = this.storage.get(fullKey)
      if (existingItem && !this.isExpired(existingItem)) {
        return false
      }
    }

    const now = Date.now()
    const ttl = options?.ttl || options?.ex || this.config.defaultTtl
    const expiry = ttl ? now + ttl * 1000 : undefined

    const item: CacheItem<T> = {
      value,
      expiry,
      createdAt: now,
      accessCount: 0,
      lastAccessed: now,
    }

    this.storage.set(fullKey, item)
    return true
  }

  async del(key: string | string[], namespace?: string): Promise<number> {
    this.stats.operations++
    const keys = Array.isArray(key) ? key : [key]
    let deleted = 0

    for (const k of keys) {
      const fullKey = this.buildKey(k, namespace)
      if (this.storage.delete(fullKey)) {
        deleted++
      }
    }

    return deleted
  }

  async exists(key: string, namespace?: string): Promise<boolean> {
    this.stats.operations++
    const fullKey = this.buildKey(key, namespace)
    const item = this.storage.get(fullKey)

    if (!item) return false
    if (this.isExpired(item)) {
      this.storage.delete(fullKey)
      return false
    }

    return true
  }

  async ttl(key: string, namespace?: string): Promise<number> {
    this.stats.operations++
    const fullKey = this.buildKey(key, namespace)
    const item = this.storage.get(fullKey)

    if (!item) return -2 // Key doesn't exist
    if (!item.expiry) return -1 // Key exists but has no expiry

    const remaining = Math.ceil((item.expiry - Date.now()) / 1000)
    return remaining > 0 ? remaining : -2
  }

  async expire(key: string, seconds: number, namespace?: string): Promise<boolean> {
    this.stats.operations++
    const fullKey = this.buildKey(key, namespace)
    const item = this.storage.get(fullKey)

    if (!item || this.isExpired(item)) return false

    item.expiry = Date.now() + seconds * 1000
    return true
  }

  async keys(pattern: string, namespace?: string): Promise<string[]> {
    this.stats.operations++
    const fullPattern = this.buildKey(pattern, namespace)
    const regex = new RegExp(fullPattern.replace(/\*/g, ".*").replace(/\?/g, "."))
    const matchingKeys: string[] = []

    for (const [key, item] of this.storage.entries()) {
      if (regex.test(key) && !this.isExpired(item)) {
        // Remove namespace prefix
        const prefix = this.buildKey("", namespace)
        matchingKeys.push(key.replace(prefix, ""))
      }
    }

    return matchingKeys
  }

  async clear(namespace?: string): Promise<boolean> {
    this.stats.operations++

    if (!namespace && !this.config.namespace) {
      this.storage.clear()
      return true
    }

    const prefix = this.buildKey("", namespace)
    const keysToDelete: string[] = []

    for (const key of this.storage.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.storage.delete(key)
    }

    return true
  }

  async getStats(): Promise<CacheStats> {
    const hitRate = this.stats.operations > 0 ? (this.stats.hits / this.stats.operations) * 100 : 0

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      keys: this.storage.size,
      memory: this.getMemoryUsage(),
      hitRate: Math.round(hitRate * 100) / 100,
    }
  }

  async isHealthy(): Promise<boolean> {
    return true // Memory cache is always healthy
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.storage.clear()
    this.logger.log("Memory cache provider destroyed")
  }
}
