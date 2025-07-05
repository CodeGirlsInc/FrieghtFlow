import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { QRGeneratorController } from "./controllers/qr-generator.controller"
import { QRGeneratorService } from "./services/qr-generator.service"
import { QRHashService } from "./services/qr-hash.service"
import { QRImageService } from "./services/qr-image.service"
import { QRAnalyticsService } from "./services/qr-analytics.service"
import { QRCode } from "./entities/qr-code.entity"
import { QRScanLog } from "./entities/qr-scan-log.entity"

@Module({
  imports: [TypeOrmModule.forFeature([QRCode, QRScanLog])],
  controllers: [QRGeneratorController],
  providers: [QRGeneratorService, QRHashService, QRImageService, QRAnalyticsService],
  exports: [QRGeneratorService, QRHashService, QRImageService],
})
export class QRCodeGeneratorModule {}
