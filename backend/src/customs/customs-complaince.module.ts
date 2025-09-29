// customs-compliance.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomsComplianceService } from './customs-compliance.service';
import { CustomsComplianceController } from './customs-compliance.controller';
import { DocumentValidationService } from './services/document-validation.service';
import { CustomsDocument } from './entities/customs-document.entity';
import { ComplianceCheck } from './entities/compliance-check.entity';
import { CustomsRequirement } from './entities/customs-requirement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomsDocument, ComplianceCheck, CustomsRequirement])],
  controllers: [CustomsComplianceController],
  providers: [CustomsComplianceService, DocumentValidationService],
  exports: [CustomsComplianceService, DocumentValidationService],
})
export class CustomsComplianceModule {}
