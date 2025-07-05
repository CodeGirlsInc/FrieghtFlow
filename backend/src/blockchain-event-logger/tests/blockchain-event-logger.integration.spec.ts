import { Test, type TestingModule } from "@nestjs/testing"
import type { INestApplication } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HttpModule } from "@nestjs/axios"
import { ScheduleModule } from "@nestjs/schedule"
import * as request from "supertest"
import { BlockchainEventLoggerModule } from "../blockchain-event-logger.module"
import { BlockchainEvent, EventType, EventStatus } from "../entities/blockchain-event.entity"
import { ContractSubscription } from "../entities/contract-subscription.entity"
import { EventProcessingCheckpoint } from "../entities/event-processing-checkpoint.entity"

describe("BlockchainEventLogger Integration Tests", () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [BlockchainEvent, ContractSubscription, EventProcessingCheckpoint],
          synchronize: true,
        }),
        HttpModule,
        ScheduleModule.forRoot(),
        BlockchainEventLoggerModule,
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe("Event Subscription Management", () => {
    let subscriptionId: string

    it("should create default subscriptions", async () => {
      const response = await request(app.getHttpServer())
        .post("/event-subscriptions/create-default-subscriptions")
        .expect(201)

      expect(response.body).toHaveLength(3)
      expect(response.body[0]).toHaveProperty("id")
      expect(response.body[0].name).toBe("FreightFlow Main Contract")

      subscriptionId = response.body[0].id
    })

    it("should get all subscriptions", async () => {
      const response = await request(app.getHttpServer()).get("/event-subscriptions").expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
    })

    it("should get subscription by ID", async () => {
      const response = await request(app.getHttpServer()).get(`/event-subscriptions/${subscriptionId}`).expect(200)

      expect(response.body.id).toBe(subscriptionId)
      expect(response.body.name).toBe("FreightFlow Main Contract")
    })

    it("should update subscription", async () => {
      const updateData = {
        description: "Updated description for testing",
        maxRetries: 5,
      }

      const response = await request(app.getHttpServer())
        .put(`/event-subscriptions/${subscriptionId}`)
        .send(updateData)
        .expect(200)

      expect(response.body.description).toBe(updateData.description)
      expect(response.body.maxRetries).toBe(updateData.maxRetries)
    })

    it("should start subscription", async () => {
      const response = await request(app.getHttpServer())
        .post(`/event-subscriptions/${subscriptionId}/start`)
        .expect(200)

      expect(response.body.message).toContain("started successfully")
    })

    it("should stop subscription", async () => {
      const response = await request(app.getHttpServer())
        .post(`/event-subscriptions/${subscriptionId}/stop`)
        .expect(200)

      expect(response.body.message).toContain("stopped successfully")
    })

    it("should restart subscription", async () => {
      const response = await request(app.getHttpServer())
        .post(`/event-subscriptions/${subscriptionId}/restart`)
        .expect(200)

      expect(response.body.message).toContain("restarted successfully")
    })

    it("should create custom subscription", async () => {
      const customSubscription = {
        name: "Custom Test Subscription",
        contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
        eventTypes: [EventType.DELIVERY_CONFIRMED, EventType.PAYMENT_PROCESSED],
        description: "Custom subscription for integration testing",
        maxRetries: 3,
        retryDelayMs: 5000,
      }

      const response = await request(app.getHttpServer())
        .post("/event-subscriptions")
        .send(customSubscription)
        .expect(201)

      expect(response.body.name).toBe(customSubscription.name)
      expect(response.body.contractAddress).toBe(customSubscription.contractAddress)
      expect(response.body.eventTypes).toEqual(customSubscription.eventTypes)
    })
  })

  describe("Blockchain Events Query", () => {
    beforeAll(async () => {
      // Create some test events directly in the database for querying
      const eventRepository = app.get("BlockchainEventRepository")

      const testEvents = [
        {
          transactionHash: "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456",
          contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          eventType: EventType.DELIVERY_CONFIRMED,
          blockNumber: BigInt(12345),
          logIndex: 0,
          eventData: { data: ["0x789"], keys: ["0xabc"] },
          decodedData: { shipmentId: "0x789", deliveryTimestamp: "1640995200" },
          status: EventStatus.PROCESSED,
          blockTimestamp: new Date("2022-01-01T00:00:00Z"),
        },
        {
          transactionHash: "0x234567890abcdef234567890abcdef234567890abcdef234567890abcdef234567",
          contractAddress: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
          eventType: EventType.ESCROW_RELEASED,
          blockNumber: BigInt(12346),
          logIndex: 0,
          eventData: { data: ["0x456", "1000"], keys: ["0xdef"] },
          decodedData: { escrowId: "0x456", amount: "1000" },
          status: EventStatus.PROCESSED,
          blockTimestamp: new Date("2022-01-01T01:00:00Z"),
        },
        {
          transactionHash: "0x345678901abcdef345678901abcdef345678901abcdef345678901abcdef345678",
          contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          eventType: EventType.PAYMENT_PROCESSED,
          blockNumber: BigInt(12347),
          logIndex: 0,
          eventData: { data: ["0x111", "500"], keys: ["0x222"] },
          decodedData: { paymentId: "0x111", amount: "500" },
          status: EventStatus.FAILED,
          blockTimestamp: new Date("2022-01-01T02:00:00Z"),
        },
      ]

      for (const eventData of testEvents) {
        const event = eventRepository.create(eventData)
        await eventRepository.save(event)
      }
    })

    it("should query all events with pagination", async () => {
      const response = await request(app.getHttpServer()).get("/blockchain-events?limit=10&offset=0").expect(200)

      expect(response.body).toHaveProperty("events")
      expect(response.body).toHaveProperty("total")
      expect(response.body).toHaveProperty("page")
      expect(response.body).toHaveProperty("limit")
      expect(Array.isArray(response.body.events)).toBe(true)
      expect(response.body.total).toBeGreaterThan(0)
    })

    it("should filter events by contract address", async () => {
      const contractAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
      const response = await request(app.getHttpServer())
        .get(`/blockchain-events?contractAddress=${contractAddress}`)
        .expect(200)

      expect(response.body.events.every((event: any) => event.contractAddress === contractAddress)).toBe(true)
    })

    it("should filter events by event type", async () => {
      const response = await request(app.getHttpServer())
        .get(`/blockchain-events?eventType=${EventType.DELIVERY_CONFIRMED}`)
        .expect(200)

      expect(response.body.events.every((event: any) => event.eventType === EventType.DELIVERY_CONFIRMED)).toBe(true)
    })

    it("should filter events by status", async () => {
      const response = await request(app.getHttpServer())
        .get(`/blockchain-events?status=${EventStatus.PROCESSED}`)
        .expect(200)

      expect(response.body.events.every((event: any) => event.status === EventStatus.PROCESSED)).toBe(true)
    })

    it("should filter events by block range", async () => {
      const response = await request(app.getHttpServer())
        .get("/blockchain-events?fromBlock=12345&toBlock=12346")
        .expect(200)

      expect(
        response.body.events.every((event: any) => {
          const blockNum = Number.parseInt(event.blockNumber)
          return blockNum >= 12345 && blockNum <= 12346
        }),
      ).toBe(true)
    })

    it("should filter events by date range", async () => {
      const fromDate = "2022-01-01T00:00:00Z"
      const toDate = "2022-01-01T01:30:00Z"

      const response = await request(app.getHttpServer())
        .get(`/blockchain-events?fromDate=${fromDate}&toDate=${toDate}`)
        .expect(200)

      expect(
        response.body.events.every((event: any) => {
          const eventDate = new Date(event.blockTimestamp)
          return eventDate >= new Date(fromDate) && eventDate <= new Date(toDate)
        }),
      ).toBe(true)
    })

    it("should get events by transaction hash", async () => {
      const txHash = "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456"
      const response = await request(app.getHttpServer()).get(`/blockchain-events/transaction/${txHash}`).expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.every((event: any) => event.transactionHash === txHash)).toBe(true)
    })

    it("should get events by contract address", async () => {
      const contractAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
      const response = await request(app.getHttpServer())
        .get(`/blockchain-events/contract/${contractAddress}`)
        .expect(200)

      expect(response.body).toHaveProperty("events")
      expect(response.body).toHaveProperty("total")
      expect(response.body.events.every((event: any) => event.contractAddress === contractAddress)).toBe(true)
    })
  })

  describe("Event Processing Operations", () => {
    it("should get processing statistics", async () => {
      const response = await request(app.getHttpServer()).get("/blockchain-events/stats/processing").expect(200)

      expect(response.body).toHaveProperty("totalEvents")
      expect(response.body).toHaveProperty("processedEvents")
      expect(response.body).toHaveProperty("failedEvents")
      expect(response.body).toHaveProperty("pendingEvents")
      expect(response.body).toHaveProperty("averageProcessingTime")
      expect(typeof response.body.totalEvents).toBe("number")
    })

    it("should retry failed events", async () => {
      const response = await request(app.getHttpServer())
        .post("/blockchain-events/retry-failed?maxRetries=3")
        .expect(200)

      expect(response.body).toHaveProperty("message")
      expect(response.body).toHaveProperty("results")
      expect(Array.isArray(response.body.results)).toBe(true)
    })

    it("should cleanup old events", async () => {
      const response = await request(app.getHttpServer()).post("/blockchain-events/cleanup/1").expect(200)

      expect(response.body).toHaveProperty("message")
      expect(response.body).toHaveProperty("deletedCount")
      expect(typeof response.body.deletedCount).toBe("number")
    })
  })

  describe("Error Handling", () => {
    it("should handle invalid subscription creation", async () => {
      const invalidSubscription = {
        name: "", // Invalid empty name
        contractAddress: "invalid-address", // Invalid address format
        eventTypes: [], // Empty event types
      }

      await request(app.getHttpServer()).post("/event-subscriptions").send(invalidSubscription).expect(400)
    })

    it("should handle non-existent subscription operations", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000"

      await request(app.getHttpServer()).get(`/event-subscriptions/${nonExistentId}`).expect(404)

      await request(app.getHttpServer()).put(`/event-subscriptions/${nonExistentId}`).send({}).expect(404)

      await request(app.getHttpServer()).delete(`/event-subscriptions/${nonExistentId}`).expect(404)
    })

    it("should handle invalid event queries", async () => {
      // Invalid limit (too high)
      await request(app.getHttpServer()).get("/blockchain-events?limit=10000").expect(400)

      // Invalid date format
      await request(app.getHttpServer()).get("/blockchain-events?fromDate=invalid-date").expect(400)

      // Invalid enum values
      await request(app.getHttpServer()).get("/blockchain-events?eventType=INVALID_TYPE").expect(400)
    })

    it("should handle non-existent event operations", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000"
      const nonExistentHash = "0x0000000000000000000000000000000000000000000000000000000000000000"

      await request(app.getHttpServer()).get(`/blockchain-events/${nonExistentId}`).expect(404)

      const response = await request(app.getHttpServer())
        .get(`/blockchain-events/transaction/${nonExistentHash}`)
        .expect(200)
      expect(response.body).toHaveLength(0)
    })
  })

  describe("Subscription Lifecycle", () => {
    it("should handle complete subscription lifecycle", async () => {
      // Create subscription
      const subscriptionData = {
        name: "Lifecycle Test Subscription",
        contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
        eventTypes: [EventType.SHIPMENT_CREATED],
        description: "Testing complete lifecycle",
      }

      const createResponse = await request(app.getHttpServer())
        .post("/event-subscriptions")
        .send(subscriptionData)
        .expect(201)

      const subscriptionId = createResponse.body.id

      // Start subscription
      await request(app.getHttpServer()).post(`/event-subscriptions/${subscriptionId}/start`).expect(200)

      // Update subscription
      const updateData = { description: "Updated lifecycle test" }
      await request(app.getHttpServer()).put(`/event-subscriptions/${subscriptionId}`).send(updateData).expect(200)

      // Stop subscription
      await request(app.getHttpServer()).post(`/event-subscriptions/${subscriptionId}/stop`).expect(200)

      // Delete subscription
      await request(app.getHttpServer()).delete(`/event-subscriptions/${subscriptionId}`).expect(204)

      // Verify deletion
      await request(app.getHttpServer()).get(`/event-subscriptions/${subscriptionId}`).expect(404)
    })
  })
})
