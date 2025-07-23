import { Test, type TestingModule } from "@nestjs/testing"
import { ShipmentCacheService, type ShipmentStatus } from "../services/shipment-cache.service"
import { CacheService } from "../services/cache.service"
import type { CacheConfig } from "../interfaces/cache.interface"

describe("ShipmentCacheService", () => {
  let service: ShipmentCacheService
  let cacheService: CacheService

  beforeEach(async () => {
    const config: CacheConfig = {
      provider: "memory",
      memory: {
        maxKeys: 1000,
        maxMemory: 10 * 1024 * 1024,
        ttl: 3600,
        checkPeriod: 60000,
      },
      defaultTtl: 3600,
      namespace: "test",
      compression: false,
      serialization: true,
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentCacheService,
        {
          provide: CacheService,
          useFactory: () => new CacheService(config),
        },
      ],
    }).compile()

    service = module.get<ShipmentCacheService>(ShipmentCacheService)
    cacheService = module.get<CacheService>(CacheService)
  })

  afterEach(async () => {
    await service.clearAllShipmentCache()
    await cacheService.onModuleDestroy()
  })

  describe("shipment status caching", () => {
    it("should cache and retrieve shipment status", async () => {
      const shipmentId = "shipment-123"
      const status: ShipmentStatus = {
        id: shipmentId,
        trackingNumber: "TRK123456",
        status: "in_transit",
        currentLocation: "Distribution Center",
        estimatedDelivery: new Date("2024-01-15"),
        lastUpdated: new Date(),
        events: [
          {
            id: "event-1",
            timestamp: new Date(),
            status: "in_transit",
            location: "Distribution Center",
            description: "Package is in transit",
          },
        ],
      }

      // Initially should return null
      expect(await service.getShipmentStatus(shipmentId)).toBeNull()

      // Cache the status
      const setResult = await service.setShipmentStatus(shipmentId, status)
      expect(setResult).toBe(true)

      // Should now return the cached status
      const cachedStatus = await service.getShipmentStatus(shipmentId)
      expect(cachedStatus).toEqual(status)
    })

    it("should cache shipment by tracking number", async () => {
      const shipmentId = "shipment-456"
      const trackingNumber = "TRK789012"
      const status: ShipmentStatus = {
        id: shipmentId,
        trackingNumber,
        status: "delivered",
        currentLocation: "Customer Address",
        actualDelivery: new Date(),
        lastUpdated: new Date(),
        events: [],
      }

      await service.setShipmentStatus(shipmentId, status)

      const trackingResult = await service.getShipmentByTracking(trackingNumber)
      expect(trackingResult).toEqual({
        shipmentId,
        status: "delivered",
        lastUpdated: status.lastUpdated,
      })
    })

    it("should invalidate shipment status cache", async () => {
      const shipmentId = "shipment-789"
      const status: ShipmentStatus = {
        id: shipmentId,
        trackingNumber: "TRK345678",
        status: "created",
        lastUpdated: new Date(),
        events: [],
      }

      await service.setShipmentStatus(shipmentId, status)
      expect(await service.getShipmentStatus(shipmentId)).toEqual(status)

      await service.invalidateShipmentStatus(shipmentId)
      expect(await service.getShipmentStatus(shipmentId)).toBeNull()
    })
  })

  describe("user shipments caching", () => {
    it("should cache and retrieve user shipments", async () => {
      const userId = "user-123"
      const shipments: ShipmentStatus[] = [
        {
          id: "shipment-1",
          trackingNumber: "TRK001",
          status: "in_transit",
          lastUpdated: new Date(),
          events: [],
        },
        {
          id: "shipment-2",
          trackingNumber: "TRK002",
          status: "delivered",
          lastUpdated: new Date(),
          events: [],
        },
      ]

      expect(await service.getUserShipments(userId)).toBeNull()

      const setResult = await service.setUserShipments(userId, shipments)
      expect(setResult).toBe(true)

      const cachedShipments = await service.getUserShipments(userId)
      expect(cachedShipments).toEqual(shipments)
    })
  })

  describe("shipment events caching", () => {
    it("should cache and retrieve shipment events", async () => {
      const shipmentId = "shipment-events-test"
      const events = [
        {
          id: "event-1",
          timestamp: new Date("2024-01-10T10:00:00Z"),
          status: "created",
          location: "Origin",
          description: "Shipment created",
        },
        {
          id: "event-2",
          timestamp: new Date("2024-01-11T14:30:00Z"),
          status: "in_transit",
          location: "Distribution Center",
          description: "Package in transit",
        },
      ]

      expect(await service.getShipmentEvents(shipmentId)).toBeNull()

      const setResult = await service.setShipmentEvents(shipmentId, events)
      expect(setResult).toBe(true)

      const cachedEvents = await service.getShipmentEvents(shipmentId)
      expect(cachedEvents).toEqual(events)
    })

    it("should add new event to existing events", async () => {
      const shipmentId = "shipment-add-event-test"
      const initialEvents = [
        {
          id: "event-1",
          timestamp: new Date("2024-01-10T10:00:00Z"),
          status: "created",
          location: "Origin",
          description: "Shipment created",
        },
      ]

      await service.setShipmentEvents(shipmentId, initialEvents)

      const newEvent = {
        id: "event-2",
        timestamp: new Date("2024-01-11T14:30:00Z"),
        status: "in_transit",
        location: "Distribution Center",
        description: "Package in transit",
      }

      const addResult = await service.addShipmentEvent(shipmentId, newEvent)
      expect(addResult).toBe(true)

      const updatedEvents = await service.getShipmentEvents(shipmentId)
      expect(updatedEvents).toHaveLength(2)
      expect(updatedEvents?.[0]).toEqual(newEvent) // New event should be first
      expect(updatedEvents?.[1]).toEqual(initialEvents[0])
    })
  })

  describe("statistics caching", () => {
    it("should cache and retrieve shipment statistics", async () => {
      const period = "daily"
      const stats = {
        totalShipments: 150,
        delivered: 120,
        inTransit: 25,
        delayed: 5,
        averageDeliveryTime: 2.5,
      }

      expect(await service.getShipmentStats(period)).toBeNull()

      const setResult = await service.setShipmentStats(period, stats)
      expect(setResult).toBe(true)

      const cachedStats = await service.getShipmentStats(period)
      expect(cachedStats).toEqual(stats)
    })
  })

  describe("cache warmup", () => {
    it("should warm up cache for multiple shipments", async () => {
      const shipmentIds = ["shipment-1", "shipment-2", "shipment-3"]

      await service.warmupCache(shipmentIds)

      // Check that all shipments were cached
      for (const shipmentId of shipmentIds) {
        const status = await service.getShipmentStatus(shipmentId)
        expect(status).not.toBeNull()
        expect(status?.id).toBe(shipmentId)
        expect(status?.trackingNumber).toContain("TRK")
      }
    })
  })

  describe("cache health", () => {
    it("should return cache health information", async () => {
      const health = await service.getCacheHealth()

      expect(health).toHaveProperty("isHealthy")
      expect(health).toHaveProperty("stats")
      expect(health).toHaveProperty("provider")
      expect(health.isHealthy).toBe(true)
    })
  })

  describe("cache clearing", () => {
    it("should clear all shipment cache", async () => {
      // Add some test data
      const shipmentId = "clear-test-shipment"
      const status: ShipmentStatus = {
        id: shipmentId,
        trackingNumber: "TRK999",
        status: "created",
        lastUpdated: new Date(),
        events: [],
      }

      await service.setShipmentStatus(shipmentId, status)
      expect(await service.getShipmentStatus(shipmentId)).toEqual(status)

      // Clear all cache
      const clearResult = await service.clearAllShipmentCache()
      expect(clearResult).toBe(true)

      // Verify cache is cleared
      expect(await service.getShipmentStatus(shipmentId)).toBeNull()
    })
  })
})
