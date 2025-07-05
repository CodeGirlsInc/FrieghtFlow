import { Test, type TestingModule } from "@nestjs/testing"
import type { INestApplication } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import * as request from "supertest"
import { RewardsEngineModule } from "../../rewards-engine.module"
import { UserReward } from "../../entities/user-reward.entity"
import { RewardTransaction } from "../../entities/reward-transaction.entity"
import { TierConfiguration } from "../../entities/tier-configuration.entity"
import { Redemption } from "../../entities/redemption.entity"
import { RewardSource } from "../../entities/reward-transaction.entity"
import { RedemptionType } from "../../entities/redemption.entity"

describe("RewardsEngineController (Integration)", () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [UserReward, RewardTransaction, TierConfiguration, Redemption],
          synchronize: true,
        }),
        RewardsEngineModule,
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe("/rewards/events (POST)", () => {
    it("should process shipment completion event", async () => {
      const eventData = {
        userId: "user-123",
        source: RewardSource.SHIPMENT_COMPLETED,
        referenceId: "shipment-456",
        metadata: { value: 150, shipmentType: "standard" },
      }

      const response = await request(app.getHttpServer()).post("/rewards/events").send(eventData).expect(200)

      expect(response.body).toHaveProperty("pointsAwarded")
      expect(response.body).toHaveProperty("newBalance")
      expect(response.body).toHaveProperty("tierChanged")
      expect(response.body).toHaveProperty("newTier")
      expect(response.body.pointsAwarded).toBeGreaterThan(0)
    })

    it("should process positive review event with rating bonus", async () => {
      const eventData = {
        userId: "user-456",
        source: RewardSource.POSITIVE_REVIEW,
        metadata: { rating: 5 },
      }

      const response = await request(app.getHttpServer()).post("/rewards/events").send(eventData).expect(200)

      expect(response.body.pointsAwarded).toBeGreaterThan(100) // Should include bonus
    })

    it("should return 400 for invalid event data", async () => {
      const invalidEventData = {
        userId: "",
        source: "INVALID_SOURCE",
      }

      await request(app.getHttpServer()).post("/rewards/events").send(invalidEventData).expect(400)
    })
  })

  describe("/rewards/balance/:userId (GET)", () => {
    it("should return reward balance for existing user", async () => {
      // First create some reward activity
      await request(app.getHttpServer()).post("/rewards/events").send({
        userId: "balance-test-user",
        source: RewardSource.SHIPMENT_COMPLETED,
      })

      const response = await request(app.getHttpServer()).get("/rewards/balance/balance-test-user").expect(200)

      expect(response.body).toHaveProperty("userId")
      expect(response.body).toHaveProperty("availablePoints")
      expect(response.body).toHaveProperty("currentTier")
      expect(response.body).toHaveProperty("nextTier")
      expect(response.body.userId).toBe("balance-test-user")
    })

    it("should return 404 for non-existent user", async () => {
      await request(app.getHttpServer()).get("/rewards/balance/non-existent-user").expect(404)
    })
  })

  describe("/rewards/redemptions (POST)", () => {
    it("should create redemption successfully", async () => {
      // First earn some points
      await request(app.getHttpServer()).post("/rewards/events").send({
        userId: "redemption-test-user",
        source: RewardSource.SHIPMENT_COMPLETED,
        customPoints: 1000,
      })

      const redemptionData = {
        userId: "redemption-test-user",
        redemptionType: RedemptionType.DISCOUNT_COUPON,
        itemName: "10% Discount Coupon",
        pointsRequired: 500,
        itemDescription: "10% off your next purchase",
        monetaryValue: 25.0,
      }

      const response = await request(app.getHttpServer()).post("/rewards/redemptions").send(redemptionData).expect(201)

      expect(response.body).toHaveProperty("id")
      expect(response.body).toHaveProperty("couponCode")
      expect(response.body.itemName).toBe("10% Discount Coupon")
      expect(response.body.pointsUsed).toBe(500)
    })

    it("should return 400 for insufficient points", async () => {
      const redemptionData = {
        userId: "poor-user",
        redemptionType: RedemptionType.DISCOUNT_COUPON,
        itemName: "Expensive Item",
        pointsRequired: 10000,
      }

      await request(app.getHttpServer()).post("/rewards/redemptions").send(redemptionData).expect(400)
    })
  })

  describe("/rewards/transactions/:userId (GET)", () => {
    it("should return transaction history", async () => {
      // Create some transactions
      await request(app.getHttpServer()).post("/rewards/events").send({
        userId: "transaction-test-user",
        source: RewardSource.SHIPMENT_COMPLETED,
      })

      await request(app.getHttpServer())
        .post("/rewards/events")
        .send({
          userId: "transaction-test-user",
          source: RewardSource.POSITIVE_REVIEW,
          metadata: { rating: 4 },
        })

      const response = await request(app.getHttpServer())
        .get("/rewards/transactions/transaction-test-user?limit=10")
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body[0]).toHaveProperty("points")
      expect(response.body[0]).toHaveProperty("source")
      expect(response.body[0]).toHaveProperty("createdAt")
    })
  })

  describe("/rewards/statistics/redemptions (GET)", () => {
    it("should return redemption statistics", async () => {
      const response = await request(app.getHttpServer()).get("/rewards/statistics/redemptions").expect(200)

      expect(response.body).toHaveProperty("totalRedemptions")
      expect(response.body).toHaveProperty("totalPointsRedeemed")
      expect(response.body).toHaveProperty("redemptionsByType")
      expect(response.body).toHaveProperty("redemptionsByStatus")
    })
  })

  describe("Tier Progression Integration", () => {
    it("should upgrade user tier after sufficient activity", async () => {
      const userId = "tier-test-user"

      // Process multiple shipments to reach SILVER tier (1000 points, 5 shipments)
      for (let i = 0; i < 6; i++) {
        await request(app.getHttpServer()).post("/rewards/events").send({
          userId,
          source: RewardSource.SHIPMENT_COMPLETED,
          customPoints: 200,
        })
      }

      const response = await request(app.getHttpServer()).get(`/rewards/balance/${userId}`).expect(200)

      expect(response.body.currentTier).toBe("SILVER")
      expect(response.body.completedShipments).toBe(6)
      expect(response.body.availablePoints).toBeGreaterThan(1000) // Should include welcome bonus
    })
  })
})
