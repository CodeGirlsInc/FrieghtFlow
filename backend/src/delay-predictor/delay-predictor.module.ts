import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { DelayPredictorController } from "./controllers/delay-predictor.controller"
import { DelayPredictorService } from "./services/delay-predictor.service"
import { MLPredictorService } from "./services/ml-predictor.service"
import { DataSeederService } from "./services/data-seeder.service"
import { ShipmentData } from "./entities/shipment-data.entity"
import { PredictionLog } from "./entities/prediction-log.entity"

@Module({
  imports: [TypeOrmModule.forFeature([ShipmentData, PredictionLog])],
  controllers: [DelayPredictorController],
  providers: [DelayPredictorService, MLPredictorService, DataSeederService],
  exports: [DelayPredictorService],
})
export class DelayPredictorModule {}
