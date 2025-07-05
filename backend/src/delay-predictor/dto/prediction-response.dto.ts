import { ApiProperty } from "@nestjs/swagger"

export class PredictionResponseDto {
  @ApiProperty({ description: "Delay likelihood score (0-1)", example: 0.3456 })
  delayLikelihood: number

  @ApiProperty({ description: "Risk level", example: "MEDIUM", enum: ["LOW", "MEDIUM", "HIGH"] })
  riskLevel: string

  @ApiProperty({ description: "Estimated delay in days", example: 2 })
  estimatedDelayDays: number

  @ApiProperty({ description: "Contributing factors", example: { carrier: 0.2, route: 0.1, season: 0.05 } })
  factors: Record<string, number>

  @ApiProperty({ description: "Confidence score", example: 0.85 })
  confidence: number

  @ApiProperty({ description: "Prediction timestamp" })
  timestamp: Date
}
