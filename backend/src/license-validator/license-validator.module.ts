import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { License } from "./entities/license.entity"
import { LicenseValidation } from "./entities/license-validation.entity"
import { LicenseValidatorService } from "./services/license-validator.service"
import { MockValidationService } from "./services/mock-validation.service"
import { LicenseValidatorController } from "./controllers/license-validator.controller"

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([License, LicenseValidation])],
  controllers: [LicenseValidatorController],
  providers: [LicenseValidatorService, MockValidationService],
  exports: [LicenseValidatorService, MockValidationService],
})
export class LicenseValidatorModule {}
