import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegulatoryReportingService } from './regulatory-reporting.service';
import { RegulatoryReportingController } from './regulatory-reporting.controller';
import { RegulatoryReport } from './entities/regulatory-report.entity';
import { CustomsComplianceService } from '../customs/customs-complaince.service';
import { DocumentValidationService } from '../customs/services/document-validation.service';
import { CustomsDocument } from '../customs/entities/customs-document.entity';
import { ComplianceCheck } from '../customs/entities/compliance-check.entity';
import { CustomsRequirement } from '../customs/entities/customs-requirement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RegulatoryReport,
      CustomsDocument,
      ComplianceCheck,
      CustomsRequirement,
    ]),
  ],
  controllers: [RegulatoryReportingController],
  providers: [
    RegulatoryReportingService,
    CustomsComplianceService,
    DocumentValidationService,
  ],
  exports: [RegulatoryReportingService],
})
export class RegulatoryReportingModule {}