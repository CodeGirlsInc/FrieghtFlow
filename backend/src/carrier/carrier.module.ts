import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { MulterModule } from "@nestjs/platform-express"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { CarrierController } from "./carrier.controller"
import { CarrierService } from "./carrier.service"
import { CarrierDocumentService } from "./services/carrier-document.service"
import { VehicleService } from "./services/vehicle.service"
import { OperationalHistoryService } from "./services/operational-history.service"
import { CarrierVerificationService } from "./services/carrier-verification.service"
import { Carrier } from "./entities/carrier.entity"
import { CarrierDocument } from "./entities/carrier-document.entity"
import { Vehicle } from "./entities/vehicle.entity"
import { OperationalHistory } from "./entities/operational-history.entity"
import { CarrierVerification } from "./entities/carrier-verification.entity"
import { multerConfig } from "../upload/config/multer.config"

@Module({
  imports: [
    TypeOrmModule.forFeature([Carrier, CarrierDocument, Vehicle, OperationalHistory, CarrierVerification]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => multerConfig(configService),
      inject: [ConfigService],
    }),
  ],
  controllers: [CarrierController],
  providers: [
    CarrierService,
    CarrierDocumentService,
    VehicleService,
    OperationalHistoryService,
    CarrierVerificationService,
  ],
  exports: [CarrierService, VehicleService],
})
export class CarrierModule {}
