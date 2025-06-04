import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ComplianceService } from "./compliance.service"
import { ComplianceController } from "./compliance.controller"
import { ComplianceDocument } from "./entities/compliance-document.entity"
import { NotificationService } from "../notifications/notification.service"

@Module({
  imports: [TypeOrmModule.forFeature([ComplianceDocument])],
  controllers: [ComplianceController],
  providers: [ComplianceService, NotificationService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
