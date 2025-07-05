import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { PredictionLog } from "../entities/prediction-log.entity"
import type { MLPredictorService } from "./ml-predictor.service"
import type { PredictionInput, PredictionResult } from "../interfaces/predictor.interface"
import type { PredictionRequestDto } from "../dto/prediction-request.dto"
import type { PredictionResponseDto } from "../dto/prediction-response.dto"

@Injectable()
export class DelayPredictorService {
  private readonly logger = new Logger(DelayPredictorService.name)
  private predictionLogRepository: Repository<PredictionLog>
  private mlPredictorService: MLPredictorService

  constructor(predictionLogRepository: Repository<PredictionLog>, mlPredictorService: MLPredictorService) {
    this.predictionLogRepository = predictionLogRepository
    this.mlPredictorService = mlPredictorService
  }

  async predictDelay(request: PredictionRequestDto): Promise<PredictionResponseDto> {
    this.logger.log(`Predicting delay for shipment: ${request.origin} -> ${request.destination}`)

    const input: PredictionInput = {
      origin: request.origin,
      destination: request.destination,
      carrier: request.carrier,
      shipmentDate: new Date(request.shipmentDate),
      distance: request.distance,
      weatherCondition: request.weatherCondition,
    }

    const prediction = await this.mlPredictorService.predict(input)

    // Log the prediction
    await this.logPrediction(request, prediction)

    return {
      delayLikelihood: prediction.delayLikelihood,
      riskLevel: prediction.riskLevel,
      estimatedDelayDays: prediction.estimatedDelayDays,
      factors: prediction.factors,
      confidence: prediction.confidence,
      timestamp: new Date(),
    }
  }

  async getPredictionHistory(limit = 100): Promise<PredictionLog[]> {
    return this.predictionLogRepository.find({
      order: { createdAt: "DESC" },
      take: limit,
    })
  }

  async getCarrierStatistics(): Promise<Record<string, any>> {
    const stats = await this.predictionLogRepository
      .createQueryBuilder("log")
      .select("log.carrier")
      .addSelect("AVG(log.delayLikelihood)", "avgDelayLikelihood")
      .addSelect("COUNT(*)", "predictionCount")
      .groupBy("log.carrier")
      .getRawMany()

    return stats.reduce((acc, stat) => {
      acc[stat.log_carrier] = {
        averageDelayLikelihood: Number.parseFloat(stat.avgDelayLikelihood),
        predictionCount: Number.parseInt(stat.predictionCount),
      }
      return acc
    }, {})
  }

  async retrainModel(): Promise<void> {
    this.logger.log("Retraining prediction model...")
    await this.mlPredictorService.trainModel()
    this.logger.log("Model retrained successfully")
  }

  private async logPrediction(request: PredictionRequestDto, prediction: PredictionResult): Promise<void> {
    const log = this.predictionLogRepository.create({
      origin: request.origin,
      destination: request.destination,
      carrier: request.carrier,
      shipmentDate: new Date(request.shipmentDate),
      delayLikelihood: prediction.delayLikelihood,
      riskLevel: prediction.riskLevel,
      estimatedDelayDays: prediction.estimatedDelayDays,
      factors: prediction.factors,
    })

    await this.predictionLogRepository.save(log)
  }
}
