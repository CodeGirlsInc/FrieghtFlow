import { Test, type TestingModule } from "@nestjs/testing"
import type { INestApplication } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import * as request from "supertest"
import { DelayPredictorModule } from "../../delay-predictor.module"
import { ShipmentData } from "../../entities/shipment-data.entity"
import { PredictionLog } from "../../entities/prediction-log.entity"

describe("DelayPredictorController (Integration)", () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [ShipmentData, PredictionLog],
          synchronize: true,
        }),
        DelayPredictorModule,
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe("/delay-predictor/predict (POST)", () => {
    it("should predict delay successfully", async () => {
      const predictionRequest = {
        origin: "New York, NY",
        destination: "Los Angeles, CA",
        carrier: "FedEx",
        shipmentDate: "2024-02-15",
        distance: 2800,
        weatherCondition: "clear",
      }

      const response = await request(app.getHttpServer())
        .post("/delay-predictor/predict")
        .send(predictionRequest)
        .expect(200)

      expect(response.body).toHaveProperty("delayLikelihood")
      expect(response.body).toHaveProperty("riskLevel")
      expect(response.body).toHaveProperty("estimatedDelayDays")
      expect(response.body).toHaveProperty("factors")
      expect(response.body).toHaveProperty("confidence")
      expect(response.body).toHaveProperty("timestamp")

      expect(response.body.delayLikelihood).toBeGreaterThanOrEqual(0)
      expect(response.body.delayLikelihood).toBeLessThanOrEqual(1)
      expect(["LOW", "MEDIUM", "HIGH"]).toContain(response.body.riskLevel)
    })

    it("should return 400 for invalid input", async () => {
      const invalidRequest = {
        origin: "",
        destination: "Los Angeles, CA",
        carrier: "FedEx",
        shipmentDate: "invalid-date",
      }

      await request(app.getHttpServer()).post("/delay-predictor/predict").send(invalidRequest).expect(400)
    })
  })

  describe("/delay-predictor/history (GET)", () => {
    it("should return prediction history", async () => {
      // First make a prediction to have some history
      const predictionRequest = {
        origin: "Chicago, IL",
        destination: "Miami, FL",
        carrier: "UPS",
        shipmentDate: "2024-03-01",
      }

      await request(app.getHttpServer()).post("/delay-predictor/predict").send(predictionRequest)

      const response = await request(app.getHttpServer()).get("/delay-predictor/history?limit=10").expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
    })
  })

  describe("/delay-predictor/statistics/carriers (GET)", () => {
    it("should return carrier statistics", async () => {
      const response = await request(app.getHttpServer()).get("/delay-predictor/statistics/carriers").expect(200)

      expect(typeof response.body).toBe("object")
    })
  })

  describe("/delay-predictor/retrain (POST)", () => {
    it("should retrain model successfully", async () => {
      const response = await request(app.getHttpServer()).post("/delay-predictor/retrain").expect(200)

      expect(response.body).toHaveProperty("message")
      expect(response.body.message).toBe("Model retrained successfully")
    })
  })

  describe("/delay-predictor/seed-data (POST)", () => {
    it("should seed mock data successfully", async () => {
      const response = await request(app.getHttpServer()).post("/delay-predictor/seed-data").expect(200)

      expect(response.body).toHaveProperty("message")
      expect(response.body.message).toBe("Mock data seeded successfully")
    })
  })
})
