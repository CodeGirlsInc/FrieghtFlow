// customs-compliance.controller.ts
import { Controller, Post, Patch, Get, Body, Param } from '@nestjs/common';
import { CustomsComplianceService } from './customs-compliance.service';
import { CreateCustomsDocumentDto } from './dto/create-customs-document.dto';
import { UpdateCustomsDocumentDto } from './dto/update-customs-document.dto';
import { CreateComplianceCheckDto } from './dto/create-compliance-check.dto';
import { UpdateComplianceCheckDto } from './dto/update-compliance-check.dto';

@Controller('customs-compliance')
export class CustomsComplianceController {
  constructor(private readonly service: CustomsComplianceService) {}

  @Post('documents')
  uploadDocument(@Body() dto: CreateCustomsDocumentDto) {
    return this.service.uploadDocument(dto);
  }

  @Patch('documents/:id')
  updateDocument(
    @Param('id') id: string,
    @Body() dto: UpdateCustomsDocumentDto,
  ) {
    return this.service.updateDocument(id, dto);
  }

  @Post('checks')
  createComplianceCheck(@Body() dto: CreateComplianceCheckDto) {
    return this.service.createComplianceCheck(dto);
  }

  @Patch('checks/:id')
  updateComplianceCheck(
    @Param('id') id: string,
    @Body() dto: UpdateComplianceCheckDto,
  ) {
    return this.service.updateComplianceCheck(id, dto);
  }

  @Get('history/:shipmentId')
  getComplianceHistory(@Param('shipmentId') shipmentId: string) {
    return this.service.getComplianceHistory(shipmentId);
  }
}
