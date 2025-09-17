// customs-compliance.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomsComplianceService } from './customs-compliance.service';
import { CustomsComplianceController } from './customs-compliance.controller';
import { CustomsDocument } from './entities/customs-document.entity';
import { ComplianceCheck } from './entities/compliance-check.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomsDocument, ComplianceCheck])],
  controllers: [CustomsComplianceController],
  providers: [CustomsComplianceService],
  exports: [CustomsComplianceService],
})
export class CustomsComplianceModule {}
