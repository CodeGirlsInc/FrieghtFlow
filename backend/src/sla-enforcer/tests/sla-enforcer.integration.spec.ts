import { Test, type TestingModule } from "@nestjs/testing"
import type { INestApplication } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HttpModule } from "@nestjs/axios"
import { ScheduleModule } from "@nestjs/schedule"
import * as request from "supertest"
import { SLAEnforcerModule } from "../sla-enforcer.module"
import { SLARule, SLAType, SLAPriority } from "../entities/sla-rule.entity"
import { Shipment, ShipmentStatus, ShipmentPriority } from "../entities/shipment.entity"
import { SLAViolation } from "../entities/sla-violation.entity"

describe("SLAEnforcer Integration Tests", () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [SLARule, Shipment, SLAViolation],
          synchronize: true,
        }),
        HttpModule,
        ScheduleModule.forRoot(),
        SLAEnforcerModule,
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe("Complete SLA enforcement workflow", () => {
    let ruleId: string
    let shipmentId: string

    it("should create default SLA rules", async () => {
      const response = await request(app.getHttpServer()).post("/sla-rules/seed-default-rules").expect(201)

      expect(response.body).toHaveLength(3)
      expect(response.body[0]).toHaveProperty("id")
      expect(response.body[0].name).toBe("Standard Delivery SLA")

      ruleId = response.body[0].id
    })

    it("should create test shipments", async () => {
      const response = await request(app.getHttpServer()).post("/shipments/create-test-shipments").expect(201)

      expect(response.body).toHaveLength(3)
      expect(response.body[0]).toHaveProperty("id")
      expect(response.body[0].trackingNumber).toBe("TEST001")

      shipmentId = response.body[0].id
    })

    it("should detect SLA violations when monitoring", async () => {
      const response = await request(app.getHttpServer()).post("/sla-monitoring/run-monitoring").expect(200)

      const violations = response.body.filter((result: any) => result.isViolated)
      expect(violations.length).toBeGreaterThan(0)

      const violation = violations[0]
      expect(violation).toHaveProperty("shipmentId")
      expect(violation).toHaveProperty("delayMinutes")
      expect(violation.delayMinutes).toBeGreaterThan(0)
    })

    it("should get violations summary", async () => {
      const response = await request(app.getHttpServer()).get("/sla-monitoring/violations/summary").expect(200)

      expect(response.body).toHaveProperty("totalViolations")
      expect(response.body).toHaveProperty("activeViolations")
      expect(response.body).toHaveProperty("violationsByPriority")
      expect(response.body).toHaveProperty("violationsByType")
    })

    it("should update shipment status", async () => {
      const response = await request(app.getHttpServer())
        .put(`/shipments/${shipmentId}/status`)
        .send({
          status: ShipmentStatus.DELIVERED,
          timestamp: new Date().toISOString(),
        })
        .expect(200)

      expect(response.body.status).toBe(ShipmentStatus.DELIVERED)
      expect(response.body.actualDeliveryAt).toBeDefined()
    })

    it("should simulate shipment progress", async () => {
      const newShipmentResponse = await request(app.getHttpServer())
        .post("/shipments")
        .send({
          trackingNumber: "SIM001",
          customerId: "customer-sim",
          origin: "Chicago, IL",
          destination: "Detroit, MI",
          priority: ShipmentPriority.EXPRESS,
          expectedDeliveryAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201)

      const simulationResponse = await request(app.getHttpServer())
        .post(`/shipments/${newShipmentResponse.body.id}/simulate-progress`)
        .expect(200)

      expect(simulationResponse.body).toHaveLength(3)
      expect(simulationResponse.body[0].status).toBe(ShipmentStatus.PICKED_UP)
      expect(simulationResponse.body[1].status).toBe(ShipmentStatus.IN_TRANSIT)
      expect(simulationResponse.body[2].status).toBe(ShipmentStatus.OUT_FOR_DELIVERY)
    })
  })

  describe("SLA Rule Management", () => {
    it("should create custom SLA rule", async () => {
      const customRule = {
        name: "Custom Test Rule",
        description: "Custom rule for testing",
        ruleType: SLAType.DELIVERY_TIME,
        priority: SLAPriority.HIGH,
        thresholdMinutes: 1440, // 1 day
        gracePeriodMinutes: 30,
        conditions: { priority: "express" },
        actions: {
          alertEmails: ["test@example.com"],
          penaltyAmount: 200,
        },
      }

      const response = await request(app.getHttpServer()).post("/sla-rules").send(customRule).expect(201)

      expect(response.body.name).toBe(customRule.name)
      expect(response.body.thresholdMinutes).toBe(customRule.thresholdMinutes)
      expect(response.body.actions.penaltyAmount).toBe(200)
    })

    it("should get all SLA rules", async () => {
      const response = await request(app.getHttpServer()).get("/sla-rules").expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
    })

    it("should filter active SLA rules", async () => {
      const response = await request(app.getHttpServer()).get("/sla-rules?isActive=true").expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.every((rule: any) => rule.isActive === true)).toBe(true)
    })
  })

  describe("Error handling", () => {
    it("should handle invalid shipment creation", async () => {
      await request(app.getHttpServer())
        .post("/shipments")
        .send({
          trackingNumber: "", // Invalid empty tracking number
          customerId: "invalid-uuid", // Invalid UUID
          origin: "Test Origin",
          destination: "Test Destination",
          priority: "invalid_priority", // Invalid priority
          expectedDeliveryAt: "invalid-date", // Invalid date
        })
        .expect(400)
    })

    it("should handle non-existent shipment updates", async () => {
      await request(app.getHttpServer())
        .put("/shipments/non-existent-id/status")
        .send({
          status: ShipmentStatus.DELIVERED,
        })
        .expect(404)
    })

    it("should handle duplicate tracking numbers", async () => {
      // First shipment should succeed
      await request(app.getHttpServer())
        .post("/shipments")
        .send({
          trackingNumber: "DUPLICATE001",
          customerId: "123e4567-e89b-12d3-a456-426614174000",
          origin: "Test Origin",
          destination: "Test Destination",
          priority: ShipmentPriority.STANDARD,
          expectedDeliveryAt: new Date().toISOString(),
        })
        .expect(201)

      // Second shipment with same tracking number should fail
      await request(app.getHttpServer())
        .post("/shipments")
        .send({
          trackingNumber: "DUPLICATE001",
          customerId: "123e4567-e89b-12d3-a456-426614174001",
          origin: "Test Origin 2",
          destination: "Test Destination 2",
          priority: ShipmentPriority.EXPRESS,
          expectedDeliveryAt: new Date().toISOString(),
        })
        .expect(409)
    })
  })
})
