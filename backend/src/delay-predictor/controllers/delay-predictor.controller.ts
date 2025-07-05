import { Controller, Post, Get, Query, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger"
import type { DelayPredictorService } from "../services/delay-predictor.service"
import type { DataSeederService } from "../services/data-seeder.service"
import type { PredictionRequestDto } from "../dto/prediction-request.dto"
import { PredictionResponseDto } from "../dto/prediction-response.dto"

@ApiTags("Delay Predictor")
@Controller("delay-predictor")
export class DelayPredictorController {
  constructor(
    private readonly delayPredictorService: DelayPredictorService,
    private readonly dataSeederService: DataSeederService,
  ) {}

  @Post("predict")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Predict shipment delay likelihood" })
  @ApiResponse({
    status: 200,
    description: "Delay prediction result",
    type: PredictionResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async predictDelay(request: PredictionRequestDto): Promise<PredictionResponseDto> {
    return this.delayPredictorService.predictDelay(request)
  }

  @Get('history')
  @ApiOperation({ summary: 'Get prediction history' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records to return' })
  @ApiResponse({ status: 200, description: 'Prediction history retrieved successfully' })
  async getPredictionHistory(@Query('limit') limit?: number) {
    return this.delayPredictorService.getPredictionHistory(limit);
  }

  @Get("statistics/carriers")
  @ApiOperation({ summary: "Get carrier delay statistics" })
  @ApiResponse({ status: 200, description: "Carrier statistics retrieved successfully" })
  async getCarrierStatistics() {
    return this.delayPredictorService.getCarrierStatistics()
  }

  @Post("retrain")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Retrain the prediction model" })
  @ApiResponse({ status: 200, description: "Model retrained successfully" })
  async retrainModel() {
    await this.delayPredictorService.retrainModel()
    return { message: "Model retrained successfully" }
  }

  @Post("seed-data")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Seed mock historical data" })
  @ApiResponse({ status: 200, description: "Mock data seeded successfully" })
  async seedMockData() {
    await this.dataSeederService.seedMockData()
    return { message: "Mock data seeded successfully" }
  }
}
