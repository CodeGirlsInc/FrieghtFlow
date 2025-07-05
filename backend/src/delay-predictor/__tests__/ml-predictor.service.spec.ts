import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { MLPredictorService } from "../services/ml-predictor.service"
import { ShipmentData } from "../entities/shipment-data.entity"
import type { PredictionInput } from "../interfaces/predictor.interface"
import { jest } from "@jest/globals"

describe("MLPredictorService", () => {
  let service: MLPredictorService
  let repository: Repository<ShipmentData>

  const mockRepository = {
    find: jest.fn(),
    count: jest.fn(),
    save: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MLPredictorService,
        {
          provide: getRepositoryToken(ShipmentData),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<MLPredictorService>(MLPredictorService)
    repository = module.get<Repository<ShipmentData>>(getRepositoryToken(ShipmentData))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("trainModel", () => {
    it("should train model with historical data", async () => {
      const mockHistoricalData: Partial<ShipmentData>[] = [
        {
          id: "1",
          origin: "New York, NY",
          destination: "Los Angeles, CA",
          carrier: "FedEx",
          shipmentDate: new Date("2024-01-15"),
          delayDays: 2,
          wasDelayed: true,
          season: "winter",
        },
        {
          id: "2",
          origin: "New York, NY",
          destination: "Los Angeles, CA",
          carrier: "FedEx",
          shipmentDate: new Date("2024-01-20"),
          delayDays: 0,
          wasDelayed: false,
          season: "winter",
        },
      ]

      mockRepository.find.mockResolvedValue(mockHistoricalData)

      await service.trainModel()

      expect(mockRepository.find).toHaveBeenCalled()
    })
  })

  describe("predict", () => {
    it("should return prediction result", async () => {
      const mockHistoricalData: Partial<ShipmentData>[] = [
        {
          id: "1",
          origin: "New York, NY",
          destination: "Los Angeles, CA",
          carrier: "FedEx",
          shipmentDate: new Date("2024-01-15"),
          delayDays: 2,
          wasDelayed: true,
          season: "winter",
        },
      ]

      mockRepository.find.mockResolvedValue(mockHistoricalData)

      const input: PredictionInput = {
        origin: "New York, NY",
        destination: "Los Angeles, CA",
        carrier: "FedEx",
        shipmentDate: new Date("2024-02-15"),
        distance: 2800,
        weatherCondition: "clear",
      }

      const result = await service.predict(input)

      expect(result).toHaveProperty("delayLikelihood")
      expect(result).toHaveProperty("riskLevel")
      expect(result).toHaveProperty("estimatedDelayDays")
      expect(result).toHaveProperty("factors")
      expect(result).toHaveProperty("confidence")
      expect(result.delayLikelihood).toBeGreaterThanOrEqual(0)
      expect(result.delayLikelihood).toBeLessThanOrEqual(1)
      expect(["LOW", "MEDIUM", "HIGH"]).toContain(result.riskLevel)
    })

    it("should handle prediction with minimal input", async () => {
      mockRepository.find.mockResolvedValue([])

      const input: PredictionInput = {
        origin: "Chicago, IL",
        destination: "Miami, FL",
        carrier: "UPS",
        shipmentDate: new Date("2024-03-01"),
      }

      const result = await service.predict(input)

      expect(result).toHaveProperty("delayLikelihood")
      expect(result.delayLikelihood).toBeGreaterThanOrEqual(0)
      expect(result.delayLikelihood).toBeLessThanOrEqual(1)
    })
  })
})
