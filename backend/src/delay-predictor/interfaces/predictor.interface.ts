export interface PredictionInput {
  origin: string
  destination: string
  carrier: string
  shipmentDate: Date
  distance?: number
  weatherCondition?: string
}

export interface PredictionResult {
  delayLikelihood: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  estimatedDelayDays: number
  factors: Record<string, number>
  confidence: number
}

export interface HistoricalPattern {
  carrier: string
  route: string
  season: string
  averageDelay: number
  delayFrequency: number
  sampleSize: number
}
