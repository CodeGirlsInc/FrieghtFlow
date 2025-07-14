import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { ShipmentData } from "../entities/shipment-data.entity"
import type { PredictionInput, PredictionResult, HistoricalPattern } from "../interfaces/predictor.interface"

@Injectable()
export class MLPredictorService {
  private readonly logger = new Logger(MLPredictorService.name)
  private patterns: Map<string, HistoricalPattern> = new Map()
  private isModelTrained = false

  constructor(shipmentDataRepository: Repository<ShipmentData>) {
    this.shipmentDataRepository = shipmentDataRepository
  }

  async trainModel(): Promise<void> {
    this.logger.log("Training delay prediction model...")

    const historicalData = await this.shipmentDataRepository.find()
    this.patterns.clear()

    // Group data by carrier, route, and season
    const groupedData = this.groupHistoricalData(historicalData)

    // Calculate patterns for each group
    for (const [key, data] of groupedData.entries()) {
      const pattern = this.calculatePattern(data)
      this.patterns.set(key, pattern)
    }

    this.isModelTrained = true
    this.logger.log(`Model trained with ${this.patterns.size} patterns`)
  }

  async predict(input: PredictionInput): Promise<PredictionResult> {
    if (!this.isModelTrained) {
      await this.trainModel()
    }

    const factors = this.calculateFactors(input)
    const delayLikelihood = this.calculateDelayLikelihood(factors)
    const riskLevel = this.determineRiskLevel(delayLikelihood)
    const estimatedDelayDays = this.estimateDelayDays(delayLikelihood, factors)
    const confidence = this.calculateConfidence(input)

    return {
      delayLikelihood: Math.round(delayLikelihood * 10000) / 10000, // Round to 4 decimal places
      riskLevel,
      estimatedDelayDays,
      factors,
      confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
    }
  }

  private groupHistoricalData(data: ShipmentData[]): Map<string, ShipmentData[]> {
    const grouped = new Map<string, ShipmentData[]>()

    for (const shipment of data) {
      const route = this.normalizeRoute(shipment.origin, shipment.destination)
      const key = `${shipment.carrier}-${route}-${shipment.season}`

      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(shipment)
    }

    return grouped
  }

  private calculatePattern(data: ShipmentData[]): HistoricalPattern {
    const totalDelay = data.reduce((sum, item) => sum + item.delayDays, 0)
    const delayedCount = data.filter((item) => item.wasDelayed).length

    return {
      carrier: data[0].carrier,
      route: this.normalizeRoute(data[0].origin, data[0].destination),
      season: data[0].season,
      averageDelay: totalDelay / data.length,
      delayFrequency: delayedCount / data.length,
      sampleSize: data.length,
    }
  }

  private calculateFactors(input: PredictionInput): Record<string, number> {
    const factors: Record<string, number> = {}

    // Carrier factor
    factors.carrier = this.getCarrierFactor(input.carrier)

    // Route factor
    const route = this.normalizeRoute(input.origin, input.destination)
    factors.route = this.getRouteFactor(route)

    // Season factor
    const season = this.getSeason(input.shipmentDate)
    factors.season = this.getSeasonFactor(season)

    // Distance factor
    if (input.distance) {
      factors.distance = this.getDistanceFactor(input.distance)
    }

    // Weather factor
    if (input.weatherCondition) {
      factors.weather = this.getWeatherFactor(input.weatherCondition)
    }

    // Day of week factor
    factors.dayOfWeek = this.getDayOfWeekFactor(input.shipmentDate)

    return factors
  }

  private calculateDelayLikelihood(factors: Record<string, number>): number {
    // Weighted sum of factors
    const weights = {
      carrier: 0.25,
      route: 0.2,
      season: 0.15,
      distance: 0.15,
      weather: 0.15,
      dayOfWeek: 0.1,
    }

    let likelihood = 0
    let totalWeight = 0

    for (const [factor, value] of Object.entries(factors)) {
      const weight = weights[factor] || 0.05
      likelihood += value * weight
      totalWeight += weight
    }

    return Math.min(Math.max(likelihood / totalWeight, 0), 1)
  }

  private determineRiskLevel(likelihood: number): "LOW" | "MEDIUM" | "HIGH" {
    if (likelihood < 0.3) return "LOW"
    if (likelihood < 0.6) return "MEDIUM"
    return "HIGH"
  }

  private estimateDelayDays(likelihood: number, factors: Record<string, number>): number {
    const baseDays = likelihood * 10 // Scale to 0-10 days
    const distanceMultiplier = factors.distance ? 1 + factors.distance * 0.5 : 1
    const weatherMultiplier = factors.weather ? 1 + factors.weather * 0.3 : 1

    return Math.round(baseDays * distanceMultiplier * weatherMultiplier)
  }

  private calculateConfidence(input: PredictionInput): number {
    const route = this.normalizeRoute(input.origin, input.destination)
    const season = this.getSeason(input.shipmentDate)
    const key = `${input.carrier}-${route}-${season}`

    const pattern = this.patterns.get(key)
    if (!pattern) return 0.5 // Default confidence for unknown patterns

    // Confidence based on sample size
    const sampleConfidence = Math.min(pattern.sampleSize / 100, 1)
    return 0.5 + sampleConfidence * 0.5 // Range: 0.5 to 1.0
  }

  private getCarrierFactor(carrier: string): number {
    const carrierReliability = {
      FedEx: 0.15,
      UPS: 0.18,
      DHL: 0.22,
      USPS: 0.35,
      "Amazon Logistics": 0.25,
    }
    return carrierReliability[carrier] || 0.3
  }

  private getRouteFactor(route: string): number {
    // Simulate route complexity based on common patterns
    const routeComplexity = {
      "cross-country": 0.4,
      regional: 0.2,
      local: 0.1,
    }

    // Simple heuristic: longer route names suggest more complexity
    if (route.length > 30) return routeComplexity["cross-country"]
    if (route.length > 20) return routeComplexity["regional"]
    return routeComplexity["local"]
  }

  private getSeasonFactor(season: string): number {
    const seasonalImpact = {
      winter: 0.4,
      fall: 0.2,
      spring: 0.15,
      summer: 0.1,
    }
    return seasonalImpact[season] || 0.2
  }

  private getDistanceFactor(distance: number): number {
    // Normalize distance to 0-1 scale (assuming max 5000 miles)
    return Math.min(distance / 5000, 1) * 0.3
  }

  private getWeatherFactor(weather: string): number {
    const weatherImpact = {
      storm: 0.6,
      snow: 0.5,
      rain: 0.3,
      fog: 0.2,
      clear: 0.05,
    }
    return weatherImpact[weather] || 0.1
  }

  private getDayOfWeekFactor(date: Date): number {
    const day = date.getDay()
    // Weekend shipments might have different delay patterns
    return day === 0 || day === 6 ? 0.15 : 0.05
  }

  private getSeason(date: Date): string {
    const month = date.getMonth()
    if (month >= 2 && month <= 4) return "spring"
    if (month >= 5 && month <= 7) return "summer"
    if (month >= 8 && month <= 10) return "fall"
    return "winter"
  }

  private normalizeRoute(origin: string, destination: string): string {
    return `${origin.toLowerCase()}-${destination.toLowerCase()}`
  }

  private shipmentDataRepository: Repository<ShipmentData>
}
