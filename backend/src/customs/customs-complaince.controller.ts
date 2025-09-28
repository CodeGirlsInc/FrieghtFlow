// customs-compliance.controller.ts
import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CustomsComplianceService } from './customs-compliance.service';
import { CreateCustomsDocumentDto } from './dto/create-customs-document.dto';
import { UpdateCustomsDocumentDto } from './dto/update-customs-document.dto';
import { CreateComplianceCheckDto } from './dto/create-compliance-check.dto';
import { UpdateComplianceCheckDto } from './dto/update-compliance-check.dto';
import { CreateCustomsRequirementDto } from './dto/create-customs-requirement.dto';
import { UpdateCustomsRequirementDto } from './dto/update-customs-requirement.dto';
import { CustomsRequirement } from './entities/customs-requirement.entity';
import { CustomsDocument } from './entities/customs-document.entity';
import { ComplianceCheck } from './entities/compliance-check.entity';

@ApiTags('Customs Compliance')
@Controller('customs-compliance')
export class CustomsComplianceController {
  constructor(private readonly service: CustomsComplianceService) {}

  // Requirements Management Endpoints

  @Post('requirements')
  @ApiOperation({ summary: 'Create a new customs requirement' })
  @ApiResponse({ status: 201, description: 'Requirement created successfully', type: CustomsRequirement })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 409, description: 'Conflict - Requirement code already exists' })
  async createRequirement(@Body() dto: CreateCustomsRequirementDto): Promise<CustomsRequirement> {
    return this.service.createRequirement(dto);
  }

  @Get('requirements')
  @ApiOperation({ summary: 'Get all customs requirements with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Requirements retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'requirementCode', required: false, type: String, description: 'Filter by requirement code' })
  @ApiQuery({ name: 'type', required: false, enum: ['document', 'compliance_check', 'declaration', 'permit', 'license'] })
  @ApiQuery({ name: 'originCountry', required: false, type: String, description: 'Filter by origin country' })
  @ApiQuery({ name: 'destinationCountry', required: false, type: String, description: 'Filter by destination country' })
  @ApiQuery({ name: 'shipmentType', required: false, type: String, description: 'Filter by shipment type' })
  @ApiQuery({ name: 'cargoType', required: false, type: String, description: 'Filter by cargo type' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'deprecated'] })
  async findAllRequirements(@Query() query: any) {
    return this.service.findAllRequirements(query);
  }

  @Get('requirements/:id')
  @ApiOperation({ summary: 'Get requirement by ID' })
  @ApiParam({ name: 'id', description: 'Requirement ID' })
  @ApiResponse({ status: 200, description: 'Requirement retrieved successfully', type: CustomsRequirement })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  async findRequirementById(@Param('id') id: string): Promise<CustomsRequirement> {
    return this.service.findRequirementById(id);
  }

  @Patch('requirements/:id')
  @ApiOperation({ summary: 'Update requirement' })
  @ApiParam({ name: 'id', description: 'Requirement ID' })
  @ApiResponse({ status: 200, description: 'Requirement updated successfully', type: CustomsRequirement })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  async updateRequirement(
    @Param('id') id: string,
    @Body() dto: UpdateCustomsRequirementDto,
  ): Promise<CustomsRequirement> {
    return this.service.updateRequirement(id, dto);
  }

  @Delete('requirements/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete requirement' })
  @ApiParam({ name: 'id', description: 'Requirement ID' })
  @ApiResponse({ status: 204, description: 'Requirement deleted successfully' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  async deleteRequirement(@Param('id') id: string): Promise<void> {
    return this.service.deleteRequirement(id);
  }

  @Get('requirements/applicable')
  @ApiOperation({ summary: 'Get applicable requirements for a route' })
  @ApiQuery({ name: 'originCountry', required: true, type: String, description: 'Origin country code' })
  @ApiQuery({ name: 'destinationCountry', required: true, type: String, description: 'Destination country code' })
  @ApiQuery({ name: 'shipmentType', required: false, type: String, description: 'Shipment type' })
  @ApiQuery({ name: 'cargoType', required: false, type: String, description: 'Cargo type' })
  @ApiResponse({ status: 200, description: 'Applicable requirements retrieved successfully', type: [CustomsRequirement] })
  async getApplicableRequirements(
    @Query('originCountry') originCountry: string,
    @Query('destinationCountry') destinationCountry: string,
    @Query('shipmentType') shipmentType?: string,
    @Query('cargoType') cargoType?: string,
  ): Promise<CustomsRequirement[]> {
    return this.service.getApplicableRequirements(originCountry, destinationCountry, shipmentType, cargoType);
  }

  // Document Management Endpoints

  @Post('documents')
  @ApiOperation({ summary: 'Upload a customs document' })
  @ApiResponse({ status: 201, description: 'Document uploaded and validated successfully', type: CustomsDocument })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async uploadDocument(@Body() dto: CreateCustomsDocumentDto): Promise<CustomsDocument> {
    return this.service.uploadDocument(dto);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Get all customs documents with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'shipmentId', required: false, type: String, description: 'Filter by shipment ID' })
  @ApiQuery({ name: 'documentType', required: false, enum: ['commercial_invoice', 'packing_list', 'bill_of_lading', 'air_waybill', 'certificate_of_origin', 'export_license', 'import_license', 'phytosanitary_certificate', 'health_certificate', 'insurance_certificate', 'customs_declaration', 'other'] })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'under_review', 'approved', 'rejected', 'expired'] })
  @ApiQuery({ name: 'requirementId', required: false, type: String, description: 'Filter by requirement ID' })
  async findAllDocuments(@Query() query: any) {
    return this.service.findAllDocuments(query);
  }

  @Get('documents/:id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully', type: CustomsDocument })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findDocumentById(@Param('id') id: string): Promise<CustomsDocument> {
    return this.service.findDocumentById(id);
  }

  @Patch('documents/:id')
  @ApiOperation({ summary: 'Update document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document updated successfully', type: CustomsDocument })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async updateDocument(
    @Param('id') id: string,
    @Body() dto: UpdateCustomsDocumentDto,
  ): Promise<CustomsDocument> {
    return this.service.updateDocument(id, dto);
  }

  @Delete('documents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 204, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(@Param('id') id: string): Promise<void> {
    return this.service.deleteDocument(id);
  }

  @Post('documents/:id/validate')
  @ApiOperation({ summary: 'Validate a document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document validation completed' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async validateDocument(@Param('id') id: string) {
    return this.service.validateDocument(id);
  }

  // Compliance Check Management Endpoints

  @Post('checks')
  @ApiOperation({ summary: 'Create a compliance check' })
  @ApiResponse({ status: 201, description: 'Compliance check created successfully', type: ComplianceCheck })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async createComplianceCheck(@Body() dto: CreateComplianceCheckDto): Promise<ComplianceCheck> {
    return this.service.createComplianceCheck(dto);
  }

  @Get('checks')
  @ApiOperation({ summary: 'Get all compliance checks with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Compliance checks retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'shipmentId', required: false, type: String, description: 'Filter by shipment ID' })
  @ApiQuery({ name: 'checkType', required: false, enum: ['document_validation', 'content_verification', 'expiry_check', 'signature_verification', 'value_verification', 'classification_check', 'restriction_check', 'quota_check', 'security_screening', 'other'] })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'in_progress', 'passed', 'failed', 'waived', 'expired'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['low', 'medium', 'high', 'critical'] })
  @ApiQuery({ name: 'isAutomated', required: false, type: Boolean, description: 'Filter by automation status' })
  async findAllComplianceChecks(@Query() query: any) {
    return this.service.findAllComplianceChecks(query);
  }

  @Get('checks/:id')
  @ApiOperation({ summary: 'Get compliance check by ID' })
  @ApiParam({ name: 'id', description: 'Compliance check ID' })
  @ApiResponse({ status: 200, description: 'Compliance check retrieved successfully', type: ComplianceCheck })
  @ApiResponse({ status: 404, description: 'Compliance check not found' })
  async findComplianceCheckById(@Param('id') id: string): Promise<ComplianceCheck> {
    return this.service.findComplianceCheckById(id);
  }

  @Patch('checks/:id')
  @ApiOperation({ summary: 'Update compliance check' })
  @ApiParam({ name: 'id', description: 'Compliance check ID' })
  @ApiResponse({ status: 200, description: 'Compliance check updated successfully', type: ComplianceCheck })
  @ApiResponse({ status: 404, description: 'Compliance check not found' })
  async updateComplianceCheck(
    @Param('id') id: string,
    @Body() dto: UpdateComplianceCheckDto,
  ): Promise<ComplianceCheck> {
    return this.service.updateComplianceCheck(id, dto);
  }

  @Delete('checks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete compliance check' })
  @ApiParam({ name: 'id', description: 'Compliance check ID' })
  @ApiResponse({ status: 204, description: 'Compliance check deleted successfully' })
  @ApiResponse({ status: 404, description: 'Compliance check not found' })
  async deleteComplianceCheck(@Param('id') id: string): Promise<void> {
    return this.service.deleteComplianceCheck(id);
  }

  @Get('history/:shipmentId')
  @ApiOperation({ summary: 'Get compliance history for a shipment' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiResponse({ status: 200, description: 'Compliance history retrieved successfully', type: [ComplianceCheck] })
  async getComplianceHistory(@Param('shipmentId') shipmentId: string): Promise<ComplianceCheck[]> {
    return this.service.getComplianceHistory(shipmentId);
  }

  @Post('checks/generate/:shipmentId')
  @ApiOperation({ summary: 'Auto-generate compliance checks for a shipment' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiResponse({ status: 201, description: 'Compliance checks generated successfully', type: [ComplianceCheck] })
  async generateComplianceChecks(@Param('shipmentId') shipmentId: string): Promise<ComplianceCheck[]> {
    return this.service.generateComplianceChecks(shipmentId);
  }

  // Compliance Validation Endpoints

  @Get('compliance/:shipmentId')
  @ApiOperation({ summary: 'Check shipment compliance status' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Compliance status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        compliant: { type: 'boolean' },
        reasons: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async checkShipmentCompliance(@Param('shipmentId') shipmentId: string) {
    return this.service.isShipmentCompliant(shipmentId);
  }
}
