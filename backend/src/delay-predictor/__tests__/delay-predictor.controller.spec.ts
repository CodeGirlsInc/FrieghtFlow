import { Test, type TestingModule } from "@nestjs/testing"
import { DelayPredictorController } from "../controllers/delay-predictor.controller"
import { DelayPredictorService } from "../services/delay-predictor.service"
import { DataSeederService } from "../services/data-seeder.service"
import type { PredictionRequestDto } from "../dto/prediction-request.dto"
import { jest } from "@jest/globals"

describe("DelayPredictorController", () => {
  let controller: DelayPredictorController
  let service: DelayPredictorService
  let seederService: DataSeederService

  const mockService = {
    predictDelay: jest.fn(),
    getPredictionHistory: jest.fn(),
    getCarrierStatistics: jest.fn(),
    retrainModel: jest.fn(),
  }

  const mockSeederService = {
    seedMockData: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DelayPredictorController],
      providers: [
        {
          provide: DelayPredictorService,
          useValue: mockService,
        },
        {
          provide: DataSeederService,
          useValue: mockSeederService,
        },
      ],
    }).compile()

    controller = module.get<DelayPredictorController>(DelayPredictorController)
    service = module.get<DelayPredictorService>(DelayPredictorService)
    seederService = module.get<DataSeederService>(DataSeederService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  describe("predictDelay", () => {
    it("should return prediction result", async () => {
      const request: PredictionRequestDto = {
        origin: "New York, NY",
        destination: "Los Angeles, CA",
        carrier: "FedEx",
        shipmentDate: "2024-02-15",
      }

      const mockResponse = {
        delayLikelihood: 0.3456,
        riskLevel: "MEDIUM" as const,
        estimatedDelayDays: 2,
        factors: { carrier: 0.15 },
        confidence: 0.85,
        timestamp: new Date(),
      }

      mockService.predictDelay.mockResolvedValue(mockResponse)

      const result = await controller.predictDelay(request)

      expect(mockService.predictDelay).toHaveBeenCalledWith(request)
      expect(result).toEqual(mockResponse)
    })
  })

  describe("getPredictionHistory", () => {
    it("should return prediction history", async () => {
      const mockHistory = [{ id: "1", delayLikelihood: 0.3 }]
      mockService.getPredictionHistory.mockResolvedValue(mockHistory)

      const result = await controller.getPredictionHistory(10)

      expect(mockService.getPredictionHistory).toHaveBeenCalledWith(10)
      expect(result).toEqual(mockHistory)
    })
  })

  describe("getCarrierStatistics", () => {
    it("should return carrier statistics", async () => {
      const mockStats = { FedEx: { averageDelayLikelihood: 0.25 } }
      mockService.getCarrierStatistics.mockResolvedValue(mockStats)

      const result = await controller.getCarrierStatistics()

      expect(mockService.getCarrierStatistics).toHaveBeenCalled()
      expect(result).toEqual(mockStats)
    })
  })

  describe("retrainModel", () => {
    it("should retrain model", async () => {
      mockService.retrainModel.mockResolvedValue(undefined)

      const result = await controller.retrainModel()

      expect(mockService.retrainModel).toHaveBeenCalled()
      expect(result).toEqual({ message: "Model retrained successfully" })
    })
  })

  describe("seedMockData", () => {
    it("should seed mock data", async () => {
      mockSeederService.seedMockData.mockResolvedValue(undefined)

      const result = await controller.seedMockData()

      expect(mockSeederService.seedMockData).toHaveBeenCalled()
      expect(result).toEqual({ message: "Mock data seeded successfully" })
    })
  })
})
