import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InsuranceService } from '../services/insurance.service';
import { CreateInsurancePolicyDto } from '../dto/create-insurance-policy.dto';
import { UpdateInsurancePolicyDto } from '../dto/update-insurance-policy.dto';
import { CreateClaimDto } from '../dto/create-claim.dto';
import { UpdateClaimDto } from '../dto/update-claim.dto';
import { InsurancePolicyQueryDto, ClaimQueryDto } from '../dto/insurance-query.dto';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { ClaimHistory } from '../entities/claim-history.entity';

@ApiTags('Insurance')
@Controller('insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  // Insurance Policy Endpoints

  @Post('policies')
  @ApiOperation({ summary: 'Create a new insurance policy' })
  @ApiResponse({ status: 201, description: 'Insurance policy created successfully', type: InsurancePolicy })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 409, description: 'Conflict - Policy number already exists' })
  async createInsurancePolicy(@Body() createDto: CreateInsurancePolicyDto): Promise<InsurancePolicy> {
    return await this.insuranceService.createInsurancePolicy(createDto);
  }

  @Get('policies')
  @ApiOperation({ summary: 'Get all insurance policies with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Insurance policies retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'policyNumber', required: false, type: String, description: 'Filter by policy number' })
  @ApiQuery({ name: 'provider', required: false, type: String, description: 'Filter by provider' })
  @ApiQuery({ name: 'coverageType', required: false, enum: ['all_risk', 'general_average', 'particular_average', 'free_of_particular_average', 'total_loss_only', 'cargo', 'liability'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'expired', 'cancelled', 'suspended', 'pending'] })
  @ApiQuery({ name: 'shipmentId', required: false, type: String, description: 'Filter by shipment ID' })
  async findAllInsurancePolicies(@Query() queryDto: InsurancePolicyQueryDto) {
    return await this.insuranceService.findAllInsurancePolicies(queryDto);
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Get insurance policy by ID' })
  @ApiParam({ name: 'id', description: 'Insurance policy ID' })
  @ApiResponse({ status: 200, description: 'Insurance policy retrieved successfully', type: InsurancePolicy })
  @ApiResponse({ status: 404, description: 'Insurance policy not found' })
  async findInsurancePolicyById(@Param('id') id: string): Promise<InsurancePolicy> {
    return await this.insuranceService.findInsurancePolicyById(id);
  }

  @Get('policies/policy-number/:policyNumber')
  @ApiOperation({ summary: 'Get insurance policy by policy number' })
  @ApiParam({ name: 'policyNumber', description: 'Insurance policy number' })
  @ApiResponse({ status: 200, description: 'Insurance policy retrieved successfully', type: InsurancePolicy })
  @ApiResponse({ status: 404, description: 'Insurance policy not found' })
  async findInsurancePolicyByPolicyNumber(@Param('policyNumber') policyNumber: string): Promise<InsurancePolicy> {
    return await this.insuranceService.findInsurancePolicyByPolicyNumber(policyNumber);
  }

  @Patch('policies/:id')
  @ApiOperation({ summary: 'Update insurance policy' })
  @ApiParam({ name: 'id', description: 'Insurance policy ID' })
  @ApiResponse({ status: 200, description: 'Insurance policy updated successfully', type: InsurancePolicy })
  @ApiResponse({ status: 404, description: 'Insurance policy not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 409, description: 'Conflict - Policy number already exists' })
  async updateInsurancePolicy(
    @Param('id') id: string,
    @Body() updateDto: UpdateInsurancePolicyDto,
  ): Promise<InsurancePolicy> {
    return await this.insuranceService.updateInsurancePolicy(id, updateDto);
  }

  @Delete('policies/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete insurance policy' })
  @ApiParam({ name: 'id', description: 'Insurance policy ID' })
  @ApiResponse({ status: 204, description: 'Insurance policy deleted successfully' })
  @ApiResponse({ status: 404, description: 'Insurance policy not found' })
  async deleteInsurancePolicy(@Param('id') id: string): Promise<void> {
    return await this.insuranceService.deleteInsurancePolicy(id);
  }

  @Get('shipments/:shipmentId/policies')
  @ApiOperation({ summary: 'Get insurance policies for a specific shipment' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment ID' })
  @ApiResponse({ status: 200, description: 'Insurance policies retrieved successfully', type: [InsurancePolicy] })
  async getInsurancePoliciesByShipment(@Param('shipmentId') shipmentId: string): Promise<InsurancePolicy[]> {
    return await this.insuranceService.getInsurancePoliciesByShipment(shipmentId);
  }

  // Claim History Endpoints

  @Post('claims')
  @ApiOperation({ summary: 'Create a new claim' })
  @ApiResponse({ status: 201, description: 'Claim created successfully', type: ClaimHistory })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 404, description: 'Insurance policy not found' })
  @ApiResponse({ status: 409, description: 'Conflict - Claim number already exists' })
  async createClaim(@Body() createDto: CreateClaimDto): Promise<ClaimHistory> {
    return await this.insuranceService.createClaim(createDto);
  }

  @Get('claims')
  @ApiOperation({ summary: 'Get all claims with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Claims retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'claimNumber', required: false, type: String, description: 'Filter by claim number' })
  @ApiQuery({ name: 'claimType', required: false, enum: ['damage', 'loss', 'theft', 'delay', 'general_average', 'particular_average', 'other'] })
  @ApiQuery({ name: 'status', required: false, enum: ['submitted', 'under_review', 'approved', 'rejected', 'settled', 'closed'] })
  @ApiQuery({ name: 'insurancePolicyId', required: false, type: String, description: 'Filter by insurance policy ID' })
  async findAllClaims(@Query() queryDto: ClaimQueryDto) {
    return await this.insuranceService.findAllClaims(queryDto);
  }

  @Get('claims/:id')
  @ApiOperation({ summary: 'Get claim by ID' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 200, description: 'Claim retrieved successfully', type: ClaimHistory })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async findClaimById(@Param('id') id: string): Promise<ClaimHistory> {
    return await this.insuranceService.findClaimById(id);
  }

  @Get('claims/claim-number/:claimNumber')
  @ApiOperation({ summary: 'Get claim by claim number' })
  @ApiParam({ name: 'claimNumber', description: 'Claim number' })
  @ApiResponse({ status: 200, description: 'Claim retrieved successfully', type: ClaimHistory })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async findClaimByClaimNumber(@Param('claimNumber') claimNumber: string): Promise<ClaimHistory> {
    return await this.insuranceService.findClaimByClaimNumber(claimNumber);
  }

  @Patch('claims/:id')
  @ApiOperation({ summary: 'Update claim' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 200, description: 'Claim updated successfully', type: ClaimHistory })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 409, description: 'Conflict - Claim number already exists' })
  async updateClaim(
    @Param('id') id: string,
    @Body() updateDto: UpdateClaimDto,
  ): Promise<ClaimHistory> {
    return await this.insuranceService.updateClaim(id, updateDto);
  }

  @Delete('claims/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete claim' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ status: 204, description: 'Claim deleted successfully' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async deleteClaim(@Param('id') id: string): Promise<void> {
    return await this.insuranceService.deleteClaim(id);
  }

  @Get('policies/:insurancePolicyId/claims')
  @ApiOperation({ summary: 'Get claims for a specific insurance policy' })
  @ApiParam({ name: 'insurancePolicyId', description: 'Insurance policy ID' })
  @ApiResponse({ status: 200, description: 'Claims retrieved successfully', type: [ClaimHistory] })
  async getClaimsByInsurancePolicy(@Param('insurancePolicyId') insurancePolicyId: string): Promise<ClaimHistory[]> {
    return await this.insuranceService.getClaimsByInsurancePolicy(insurancePolicyId);
  }

  // Analytics and Reporting Endpoints

  @Get('statistics')
  @ApiOperation({ summary: 'Get insurance statistics and analytics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Insurance statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalPolicies: { type: 'number' },
        activePolicies: { type: 'number' },
        expiredPolicies: { type: 'number' },
        totalClaims: { type: 'number' },
        pendingClaims: { type: 'number' },
        approvedClaims: { type: 'number' },
        totalClaimAmount: { type: 'number' },
        totalPaidAmount: { type: 'number' },
      },
    },
  })
  async getInsuranceStatistics() {
    return await this.insuranceService.getInsuranceStatistics();
  }
}
