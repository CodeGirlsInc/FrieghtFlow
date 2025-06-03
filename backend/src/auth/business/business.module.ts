import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BusinessController } from "./controllers/business.controller"
import { BusinessProfileController } from "./controllers/business-profile.controller"
import { ServicePackageController } from "./controllers/service-package.controller"
import { VerificationController } from "./controllers/verification.controller"
import { BusinessService } from "./services/business.service"
import { BusinessProfileService } from "./services/business-profile.service"
import { ServicePackageService } from "./services/service-package.service"
import { VerificationService } from "./services/verification.service"
import { Business } from "./entities/business.entity"
import { BusinessProfile } from "./entities/business-profile.entity"
import { ServicePackage } from "./entities/service-package.entity"
import { BusinessServiceSelection } from "./entities/business-service-selection.entity"
import { VerificationStatus } from "./entities/verification-status.entity"
import { ConfigModule } from "../config/config.module"
import { ComplianceModule } from "../compliance/compliance.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, BusinessProfile, ServicePackage, BusinessServiceSelection, VerificationStatus]),
    ConfigModule,
    ComplianceModule,
  ],
  controllers: [BusinessController, BusinessProfileController, ServicePackageController, VerificationController],
  providers: [BusinessService, BusinessProfileService, ServicePackageService, VerificationService],
  exports: [BusinessService, BusinessProfileService, ServicePackageService, VerificationService],
})
export class BusinessModule {}
