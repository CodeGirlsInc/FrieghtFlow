import { Injectable, Logger } from "@nestjs/common"
import type { CacheService } from "./services/cache.service"
import type { ShipmentCacheService, ShipmentStatus, ShipmentEvent } from "./services/shipment-cache.service"

@Injectable()
export class CacheExampleService {
  private readonly logger = new Logger(CacheExampleService.name)

  constructor(
    private readonly cacheService: CacheService,
    private readonly shipmentCacheService: ShipmentCacheService,
  ) {}

  // Basic cache operations examples
  async basicCacheOperations(): Promise<void> {
    this.logger.log("🔄 Demonstrating basic cache operations...")

    // Set a simple value
    await this.cacheService.set("user:123", { name: "John Doe", email: "john@example.com" }, { ttl: 3600 })

    // Get the value
    const user = await this.cacheService.get("user:123")
    this.logger.log("Retrieved user:", user)

    // Check if key exists
    const exists = await this.cacheService.exists("user:123")
    this.logger.log("User exists in cache:", exists)

    // Get TTL
    const ttl = await this.cacheService.ttl("user:123")
    this.logger.log("TTL for user:123:", ttl, "seconds")

    // Set with namespace
    await this.cacheService.set("config", { theme: "dark", language: "en" }, { namespace: "app-settings" })

    // Get with namespace
    const config = await this.cacheService.get("config", { namespace: "app-settings" })
    this.logger.log("App config:", config)
  }

  // Shipment caching examples
  async shipmentCachingExamples(): Promise<void> {
    this.logger.log("📦 Demonstrating shipment caching...")

    // Create sample shipment data
    const shipmentId = "shipment-demo-001"
    const shipmentStatus: ShipmentStatus = {
      id: shipmentId,
      trackingNumber: "TRK123456789",
      status: "in_transit",
      currentLocation: "Distribution Center - Chicago",
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      lastUpdated: new Date(),
      events: [
        {
          id: "event-1",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          status: "created",
          location: "Origin Facility",
          description: "Shipment created and ready for pickup",
        },
        {
          id: "event-2",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          status: "in_transit",
          location: "Distribution Center - Chicago",
          description: "Package arrived at distribution center",
        },
      ],
    }

    // Cache shipment status
    await this.shipmentCacheService.setShipmentStatus(shipmentId, shipmentStatus)
    this.logger.log("✅ Cached shipment status")

    // Retrieve shipment status
    const cachedStatus = await this.shipmentCacheService.getShipmentStatus(shipmentId)
    this.logger.log("📋 Retrieved shipment status:", cachedStatus?.status, cachedStatus?.currentLocation)

    // Get shipment by tracking number
    const trackingResult = await this.shipmentCacheService.getShipmentByTracking("TRK123456789")
    this.logger.log("🔍 Found by tracking number:", trackingResult)

    // Add a new event
    const newEvent: ShipmentEvent = {
      id: "event-3",
      timestamp: new Date(),
      status: "out_for_delivery",
      location: "Local Delivery Hub",
      description: "Package is out for delivery",
    }

    await this.shipmentCacheService.addShipmentEvent(shipmentId, newEvent)
    this.logger.log("📝 Added new shipment event")

    // Get updated events
    const events = await this.shipmentCacheService.getShipmentEvents(shipmentId)
    this.logger.log("📅 Total events:", events?.length)
  }

  // User shipments caching example
  async userShipmentsCaching(): Promise<void> {
    this.logger.log("👤 Demonstrating user shipments caching...")

    const userId = "user-456"
    const userShipments: ShipmentStatus[] = [
      {
        id: "shipment-001",
        trackingNumber: "TRK001",
        status: "delivered",
        actualDelivery: new Date(Date.now() - 24 * 60 * 60 * 1000),
        lastUpdated: new Date(),
        events: [],
      },
      {
        id: "shipment-002",
        trackingNumber: "TRK002",
        status: "in_transit",
        currentLocation: "Distribution Center",
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
        lastUpdated: new Date(),
        events: [],
      },
    ]

    // Cache user shipments
    await this.shipmentCacheService.setUserShipments(userId, userShipments)
    this.logger.log("✅ Cached user shipments")

    // Retrieve user shipments
    const cachedUserShipments = await this.shipmentCacheService.getUserShipments(userId)
    this.logger.log("📦 User has", cachedUserShipments?.length, "shipments")
  }

  // Statistics caching example
  async statisticsCaching(): Promise<void> {
    this.logger.log("📊 Demonstrating statistics caching...")

    const dailyStats = {
      date: new Date().toISOString().split("T")[0],
      totalShipments: 1250,
      delivered: 980,
      inTransit: 220,
      delayed: 35,
      cancelled: 15,
      averageDeliveryTime: 2.3,
      onTimeDeliveryRate: 94.2,
    }

    // Cache daily statistics
    await this.shipmentCacheService.setShipmentStats("daily", dailyStats)
    this.logger.log("✅ Cached daily statistics")

    // Retrieve statistics
    const cachedStats = await this.shipmentCacheService.getShipmentStats("daily")
    this.logger.log("📈 Daily stats - Total shipments:", cachedStats?.totalShipments)
    this.logger.log("📈 On-time delivery rate:", cachedStats?.onTimeDeliveryRate + "%")
  }

  // Advanced caching patterns
  async advancedCachingPatterns(): Promise<void> {
    this.logger.log("🚀 Demonstrating advanced caching patterns...")

    // Cache with conditional set (NX - only if not exists)
    const sessionKey = "session:abc123"
    const sessionData = { userId: "user-789", loginTime: new Date(), permissions: ["read", "write"] }

    const setResult = await this.cacheService.set(sessionKey, sessionData, { nx: true, ttl: 1800 })
    this.logger.log("Session created:", setResult)

    // Try to set again (should fail because key exists)
    const setAgainResult = await this.cacheService.set(sessionKey, { ...sessionData, hacked: true }, { nx: true })
    this.logger.log("Attempt to overwrite session:", setAgainResult) // Should be false

    // Pattern matching for keys
    await this.cacheService.set("user:123:profile", { name: "Alice" })
    await this.cacheService.set("user:456:profile", { name: "Bob" })
    await this.cacheService.set("user:789:profile", { name: "Charlie" })

    const userProfileKeys = await this.cacheService.keys("user:*:profile")
    this.logger.log("Found user profile keys:", userProfileKeys)

    // Bulk operations
    const keysToDelete = ["user:123:profile", "user:456:profile"]
    const deletedCount = await this.cacheService.del(keysToDelete)
    this.logger.log("Deleted", deletedCount, "user profiles")
  }

  // Cache performance monitoring
  async cachePerformanceMonitoring(): Promise<void> {
    this.logger.log("📊 Monitoring cache performance...")

    // Generate some cache activity
    for (let i = 0; i < 100; i++) {
      await this.cacheService.set(`test:${i}`, { value: i, timestamp: new Date() }, { ttl: 300 })
    }

    // Generate some hits and misses
    for (let i = 0; i < 150; i++) {
      await this.cacheService.get(`test:${i}`) // Some will hit, some will miss
    }

    // Get cache statistics
    const stats = await this.cacheService.getStats()
    this.logger.log("📈 Cache Statistics:")
    this.logger.log("  - Total keys:", stats.keys)
    this.logger.log("  - Cache hits:", stats.hits)
    this.logger.log("  - Cache misses:", stats.misses)
    this.logger.log("  - Hit rate:", stats.hitRate + "%")
    this.logger.log("  - Memory usage:", Math.round((stats.memory || 0) / 1024), "KB")

    // Check cache health
    const isHealthy = await this.cacheService.isHealthy()
    this.logger.log("💚 Cache is healthy:", isHealthy)

    // Get provider information
    const providerInfo = this.cacheService.getProviderInfo()
    this.logger.log("🔧 Cache provider:", providerInfo.primary)
    this.logger.log("🔄 Using fallback:", providerInfo.usingFallback)
  }

  // Cache warmup example
  async cacheWarmupExample(): Promise<void> {
    this.logger.log("🔥 Demonstrating cache warmup...")

    // Simulate warming up cache for frequently accessed shipments
    const popularShipmentIds = [
      "shipment-popular-001",
      "shipment-popular-002",
      "shipment-popular-003",
      "shipment-popular-004",
      "shipment-popular-005",
    ]

    await this.shipmentCacheService.warmupCache(popularShipmentIds)
    this.logger.log("✅ Cache warmed up for", popularShipmentIds.length, "popular shipments")

    // Verify warmup worked
    for (const shipmentId of popularShipmentIds) {
      const status = await this.shipmentCacheService.getShipmentStatus(shipmentId)
      if (status) {
        this.logger.log(`📦 ${shipmentId}: ${status.status} - ${status.trackingNumber}`)
      }
    }
  }

  // Cache invalidation patterns
  async cacheInvalidationPatterns(): Promise<void> {
    this.logger.log("🗑️ Demonstrating cache invalidation patterns...")

    const userId = "user-invalidation-test"
    const shipmentId = "shipment-invalidation-test"

    // Set up some cached data
    await this.shipmentCacheService.setUserShipments(userId, [
      {
        id: shipmentId,
        trackingNumber: "TRK-INVALID-001",
        status: "created",
        lastUpdated: new Date(),
        events: [],
      },
    ])

    // Cache some query results (simulated)
    await this.cacheService.set(`query:user-shipments:${userId}`, { cached: true }, { namespace: "queries" })

    this.logger.log("✅ Set up cached data for invalidation test")

    // Invalidate specific shipment
    await this.shipmentCacheService.invalidateShipmentStatus(shipmentId)
    this.logger.log("🗑️ Invalidated shipment status")

    // Invalidate user queries
    await this.shipmentCacheService.invalidateQueriesForUser(userId)
    this.logger.log("🗑️ Invalidated user query caches")

    // Verify invalidation
    const shipmentStatus = await this.shipmentCacheService.getShipmentStatus(shipmentId)
    const queryResult = await this.cacheService.get(`query:user-shipments:${userId}`, { namespace: "queries" })

    this.logger.log("Shipment status after invalidation:", shipmentStatus === null ? "✅ Cleared" : "❌ Still cached")
    this.logger.log("Query result after invalidation:", queryResult === null ? "✅ Cleared" : "❌ Still cached")
  }

  // Run all examples
  async runAllExamples(): Promise<void> {
    this.logger.log("🎯 Running comprehensive cache examples...")

    try {
      await this.basicCacheOperations()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await this.shipmentCachingExamples()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await this.userShipmentsCaching()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await this.statisticsCaching()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await this.advancedCachingPatterns()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await this.cacheWarmupExample()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await this.cacheInvalidationPatterns()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await this.cachePerformanceMonitoring()

      this.logger.log("🎉 All cache examples completed successfully!")
    } catch (error) {
      this.logger.error("❌ Error running cache examples:", error)
    }
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    this.logger.log("🧹 Cleaning up cache examples...")
    await this.shipmentCacheService.clearAllShipmentCache()
    await this.cacheService.clear()
    this.logger.log("✅ Cache cleanup completed")
  }
}
