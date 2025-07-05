import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { DelayPredictorService } from "../services/delay-predictor.service"
import { MLPredictorService } from "../services/ml-predictor.service"
import { PredictionLog } from "../entities/prediction-log.entity"
import type { PredictionRequestDto } from "../dto/prediction-request.dto"
import { jest } from "@jest/globals" // Import jest to declare it

describe("DelayPredictorService", () => {
  let service: DelayPredictorService
  let mlService: MLPredictorService
  let repository: Repository<PredictionLog>

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockMLService = {
    predict: jest.fn(),
    trainModel: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DelayPredictorService,
        {
          provide: getRepositoryToken(PredictionLog),
          useValue: mockRepository,
        },
        {
          provide: MLPredictorService,
          useValue: mockMLService,
        },
      ],
    }).compile()

    service = module.get<DelayPredictorService>(DelayPredictorService)
    mlService = module.get<MLPredictorService>(MLPredictorService)
    repository = module.get<Repository<PredictionLog>>(getRepositoryToken(PredictionLog))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("predictDelay", () => {
    it("should predict delay and log result", async () => {
      const request: PredictionRequestDto = {
        origin: "New York, NY",
        destination: "Los Angeles, CA",
        carrier: "FedEx",
        shipmentDate: "2024-02-15",
        distance: 2800,
        weatherCondition: "clear",
      }

      const mockPrediction = {
        delayLikelihood: 0.3456,
        riskLevel: "MEDIUM" as const,
        estimatedDelayDays: 2,
        factors: { carrier: 0.15, route: 0.2 },
        confidence: 0.85,
      }

      mockMLService.predict.mockResolvedValue(mockPrediction)
      mockRepository.create.mockReturnValue({})
      mockRepository.save.mockResolvedValue({})

      const result = await service.predictDelay(request)

      expect(mockMLService.predict).toHaveBeenCalled()
      expect(mockRepository.create).toHaveBeenCalled()
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result.delayLikelihood).toBe(0.3456)
      expect(result.riskLevel).toBe("MEDIUM")
      expect(result.estimatedDelayDays).toBe(2)
      expect(result).toHaveProperty("timestamp")
    })
  })

  describe("getPredictionHistory", () => {
    it("should return prediction history", async () => {
      const mockHistory = [
        {
          id: "1",
          origin: "New York, NY",
          destination: "Los Angeles, CA",
          delayLikelihood: 0.3,
          createdAt: new Date(),
        },
      ]

      mockRepository.find.mockResolvedValue(mockHistory)

      const result = await service.getPredictionHistory(10)

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: "DESC" },
        take: 10,
      })
      expect(result).toEqual(mockHistory)
    })
  })

  describe("getCarrierStatistics", () => {
    it("should return carrier statistics", async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          {
            log_carrier: "FedEx",
            avgDelayLikelihood: "0.25",
            predictionCount: "100",
          },
        ]),
      }

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const result = await service.getCarrierStatistics()

      expect(result).toEqual({
        FedEx: {
          averageDelayLikelihood: 0.25,
          predictionCount: 100,
        },
      })
    })
  })

  describe("retrainModel", () => {
    it("should retrain the ML model", async () => {
      mockMLService.trainModel.mockResolvedValue(undefined)

      await service.retrainModel()

      expect(mockMLService.trainModel).toHaveBeenCalled()
    })
  })
})
