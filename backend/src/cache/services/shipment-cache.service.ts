import { Injectable, Logger } from "@nestjs/common"
import type { CacheService } from "./cache.service"

export interface ShipmentStatus {
  id: string
  trackingNumber: string
  status: "created" | "in_transit" | "delivered" | "delayed" | "cancelled"
  currentLocation?: string
  estimatedDelivery?: Date
  actualDelivery?: Date
  lastUpdated: Date
  events: ShipmentEvent[]
}

export interface ShipmentEvent {
  id: string
  timestamp: Date
  status: string
  location: string
  description: string
  metadata?: Record<string, any>
}

export interface ShipmentQuery {
  userId?: string
  status?: string
  dateRange?: {
    start: Date
    end: Date
  }
  limit?: number
  offset?: number
}

@Injectable()
export class ShipmentCacheService {
  private readonly logger = new Logger(ShipmentCacheService.name)
  private readonly SHIPMENT_TTL = 3600 // 1 hour
  private readonly QUERY_TTL = 300 // 5 minutes
  private readonly STATUS_TTL = 1800 // 30 minutes

  constructor(private readonly cacheService: CacheService) {}

  // Shipment Status Caching
  async getShipmentStatus(shipmentId: string): Promise<ShipmentStatus | null> {
    const key = `shipment:status:${shipmentId}`

    try {
      const cached = await this.cacheService.get<ShipmentStatus>(key, { namespace: "shipments" })

      if (cached) {
        this.logger.debug(`Cache hit for shipment status: ${shipmentId}`)
        return cached
      }

      this.logger.debug(`Cache miss for shipment status: ${shipmentId}`)
      return null
    } catch (error) {
      this.logger.error(`Failed to get shipment status from cache: ${shipmentId}`, error)
      return null
    }
  }

  async setShipmentStatus(shipmentId: string, status: ShipmentStatus): Promise<boolean> {
    const key = `shipment:status:${shipmentId}`

    try {
      const result = await this.cacheService.set(key, status, {
        ttl: this.SHIPMENT_TTL,
        namespace: "shipments",
      })

      if (result) {
        this.logger.debug(`Cached shipment status: ${shipmentId}`)

        // Also cache by tracking number for quick lookups
        await this.cacheService.set(
          `tracking:${status.trackingNumber}`,
          { shipmentId, status: status.status, lastUpdated: status.lastUpdated },
          { ttl: this.SHIPMENT_TTL, namespace: "shipments" },
        )
      }

      return result
    } catch (error) {
      this.logger.error(`Failed to cache shipment status: ${shipmentId}`, error)
      return false
    }
  }

  async getShipmentByTracking(
    trackingNumber: string,
  ): Promise<{ shipmentId: string; status: string; lastUpdated: Date } | null> {
    const key = `tracking:${trackingNumber}`

    try {
      return await this.cacheService.get(key, { namespace: "shipments" })
    } catch (error) {
      this.logger.error(`Failed to get shipment by tracking number: ${trackingNumber}`, error)
      return null
    }
  }

  async invalidateShipmentStatus(shipmentId: string): Promise<void> {
    try {
      // Get the shipment to find tracking number
      const shipment = await this.getShipmentStatus(shipmentId)

      // Delete shipment status cache
      await this.cacheService.del(`shipment:status:${shipmentId}`, "shipments")

      // Delete tracking number cache if available
      if (shipment?.trackingNumber) {
        await this.cacheService.del(`tracking:${shipment.trackingNumber}`, "shipments")
      }

      this.logger.debug(`Invalidated cache for shipment: ${shipmentId}`)
    } catch (error) {
      this.logger.error(`Failed to invalidate shipment cache: ${shipmentId}`, error)
    }
  }

  // Query Result Caching
  async getQueryResult<T>(queryKey: string, query: ShipmentQuery): Promise<T | null> {
    const key = `query:${queryKey}:${this.hashQuery(query)}`

    try {
      const cached = await this.cacheService.get<T>(key, { namespace: "queries" })

      if (cached) {
        this.logger.debug(`Cache hit for query: ${queryKey}`)
        return cached
      }

      this.logger.debug(`Cache miss for query: ${queryKey}`)
      return null
    } catch (error) {
      this.logger.error(`Failed to get query result from cache: ${queryKey}`, error)
      return null
    }
  }

  async setQueryResult<T>(queryKey: string, query: ShipmentQuery, result: T): Promise<boolean> {
    const key = `query:${queryKey}:${this.hashQuery(query)}`

    try {
      const success = await this.cacheService.set(key, result, {
        ttl: this.QUERY_TTL,
        namespace: "queries",
      })

      if (success) {
        this.logger.debug(`Cached query result: ${queryKey}`)
      }

      return success
    } catch (error) {
      this.logger.error(`Failed to cache query result: ${queryKey}`, error)
      return false
    }
  }

  async invalidateQueriesForUser(userId: string): Promise<void> {
    try {
      const pattern = `query:*user:${userId}*`
      const keys = await this.cacheService.keys(pattern, "queries")

      if (keys.length > 0) {
        await this.cacheService.del(keys, "queries")
        this.logger.debug(`Invalidated ${keys.length} query caches for user: ${userId}`)
      }
    } catch (error) {
      this.logger.error(`Failed to invalidate query caches for user: ${userId}`, error)
    }
  }

  // Frequently Accessed Data Caching
  async getUserShipments(userId: string): Promise<ShipmentStatus[] | null> {
    const key = `user:shipments:${userId}`

    try {
      return await this.cacheService.get<ShipmentStatus[]>(key, { namespace: "users" })
    } catch (error) {
      this.logger.error(`Failed to get user shipments from cache: ${userId}`, error)
      return null
    }
  }

  async setUserShipments(userId: string, shipments: ShipmentStatus[]): Promise<boolean> {
    const key = `user:shipments:${userId}`

    try {
      return await this.cacheService.set(key, shipments, {
        ttl: this.STATUS_TTL,
        namespace: "users",
      })
    } catch (error) {
      this.logger.error(`Failed to cache user shipments: ${userId}`, error)
      return false
    }
  }

  async getShipmentEvents(shipmentId: string): Promise<ShipmentEvent[] | null> {
    const key = `shipment:events:${shipmentId}`

    try {
      return await this.cacheService.get<ShipmentEvent[]>(key, { namespace: "events" })
    } catch (error) {
      this.logger.error(`Failed to get shipment events from cache: ${shipmentId}`, error)
      return null
    }
  }

  async setShipmentEvents(shipmentId: string, events: ShipmentEvent[]): Promise<boolean> {
    const key = `shipment:events:${shipmentId}`

    try {
      return await this.cacheService.set(key, events, {
        ttl: this.SHIPMENT_TTL,
        namespace: "events",
      })
    } catch (error) {
      this.logger.error(`Failed to cache shipment events: ${shipmentId}`, error)
      return false
    }
  }

  async addShipmentEvent(shipmentId: string, event: ShipmentEvent): Promise<boolean> {
    try {
      // Get existing events
      const existingEvents = (await this.getShipmentEvents(shipmentId)) || []

      // Add new event
      const updatedEvents = [event, ...existingEvents].slice(0, 50) // Keep last 50 events

      // Cache updated events
      await this.setShipmentEvents(shipmentId, updatedEvents)

      // Invalidate shipment status to force refresh
      await this.invalidateShipmentStatus(shipmentId)

      return true
    } catch (error) {
      this.logger.error(`Failed to add shipment event: ${shipmentId}`, error)
      return false
    }
  }

  // Statistics and Analytics Caching
  async getShipmentStats(period: "daily" | "weekly" | "monthly"): Promise<any | null> {
    const key = `stats:shipments:${period}`

    try {
      return await this.cacheService.get(key, { namespace: "stats" })
    } catch (error) {
      this.logger.error(`Failed to get shipment stats from cache: ${period}`, error)
      return null
    }
  }

  async setShipmentStats(period: "daily" | "weekly" | "monthly", stats: any): Promise<boolean> {
    const key = `stats:shipments:${period}`
    const ttl = period === "daily" ? 3600 : period === "weekly" ? 7200 : 14400 // 1h, 2h, 4h

    try {
      return await this.cacheService.set(key, stats, {
        ttl,
        namespace: "stats",
      })
    } catch (error) {
      this.logger.error(`Failed to cache shipment stats: ${period}`, error)
      return false
    }
  }

  // Utility Methods
  private hashQuery(query: ShipmentQuery): string {
    // Simple hash function for query parameters
    const queryString = JSON.stringify(query, Object.keys(query).sort())
    let hash = 0

    for (let i = 0; i < queryString.length; i++) {
      const char = queryString.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36)
  }

  async warmupCache(shipmentIds: string[]): Promise<void> {
    this.logger.log(`Warming up cache for ${shipmentIds.length} shipments`)

    // This would typically fetch from database and cache the results
    // For demo purposes, we'll create mock data
    for (const shipmentId of shipmentIds) {
      const mockStatus: ShipmentStatus = {
        id: shipmentId,
        trackingNumber: `TRK${shipmentId.slice(-6).toUpperCase()}`,
        status: "in_transit",
        currentLocation: "Distribution Center",
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(),
        events: [
          {
            id: `event-${shipmentId}-1`,
            timestamp: new Date(),
            status: "in_transit",
            location: "Distribution Center",
            description: "Package is in transit",
          },
        ],
      }

      await this.setShipmentStatus(shipmentId, mockStatus)
    }

    this.logger.log(`Cache warmup completed for ${shipmentIds.length} shipments`)
  }

  async getCacheHealth(): Promise<{
    isHealthy: boolean
    stats: any
    provider: any
  }> {
    try {
      const isHealthy = await this.cacheService.isHealthy()
      const stats = await this.cacheService.getStats()
      const provider = this.cacheService.getProviderInfo()

      return { isHealthy, stats, provider }
    } catch (error) {
      this.logger.error("Failed to get cache health:", error)
      return {
        isHealthy: false,
        stats: null,
        provider: null,
      }
    }
  }

  async clearAllShipmentCache(): Promise<boolean> {
    try {
      await Promise.all([
        this.cacheService.clear("shipments"),
        this.cacheService.clear("queries"),
        this.cacheService.clear("users"),
        this.cacheService.clear("events"),
        this.cacheService.clear("stats"),
      ])

      this.logger.log("Cleared all shipment cache")
      return true
    } catch (error) {
      this.logger.error("Failed to clear shipment cache:", error)
      return false
    }
  }
}
