import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FreightJobsService } from '../services/freight-jobs.service';
import {
  CreateFreightJobDto,
  UpdateFreightJobDto,
  AssignCarrierDto,
  FilterFreightJobsDto,
  FreightJobResponseDto,
  PaginatedResponseDto,
} from '../dtos/freight-job.dto';

// Placeholder for auth guard - implement based on your auth strategy
@Controller('freight-jobs')
@ApiTags('Freight Jobs')
@ApiBearerAuth()
export class FreightJobsController {
  constructor(private readonly freightJobsService: FreightJobsService) {}

  /**
   * Create a new freight job
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new freight job',
    description: 'Only shippers can create freight jobs',
  })
  @ApiResponse({
    status: 201,
    description: 'Freight job created successfully',
    type: FreightJobResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createFreightJobDto: CreateFreightJobDto,
    @Request() req: any, // Placeholder for auth user
  ): Promise<FreightJobResponseDto> {
    const shipperId = req.user?.id || req.user?.sub; // Adjust based on your JWT structure
    return this.freightJobsService.create(createFreightJobDto, shipperId);
  }

  /**
   * Get all freight jobs with filtering and pagination
   */
  @Get()
  @ApiOperation({
    summary: 'Get all freight jobs',
    description: 'Retrieve freight jobs with optional filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of freight jobs',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() filters: FilterFreightJobsDto,
  ): Promise<PaginatedResponseDto<FreightJobResponseDto>> {
    return this.freightJobsService.findAll(filters);
  }

  /**
   * Get a single freight job by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a freight job by ID' })
  @ApiResponse({
    status: 200,
    description: 'Freight job details',
    type: FreightJobResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Freight job not found' })
  async findOne(@Param('id') id: string): Promise<FreightJobResponseDto> {
    return this.freightJobsService.findOne(id);
  }

  /**
   * Get all jobs for a specific shipper
   */
  @Get('shipper/:shipperId')
  @ApiOperation({
    summary: 'Get jobs for a specific shipper',
    description: 'Retrieve all freight jobs posted by a shipper',
  })
  @ApiResponse({
    status: 200,
    description: 'List of shipper jobs',
    type: PaginatedResponseDto,
  })
  async findByShipperId(
    @Param('shipperId') shipperId: string,
    @Query() filters: FilterFreightJobsDto,
  ): Promise<PaginatedResponseDto<FreightJobResponseDto>> {
    return this.freightJobsService.findByShipperId(shipperId, filters);
  }

  /**
   * Get all jobs assigned to a specific carrier
   */
  @Get('carrier/:carrierId')
  @ApiOperation({
    summary: 'Get jobs assigned to a carrier',
    description: 'Retrieve all freight jobs assigned to a carrier',
  })
  @ApiResponse({
    status: 200,
    description: 'List of carrier jobs',
    type: PaginatedResponseDto,
  })
  async findByCarrierId(
    @Param('carrierId') carrierId: string,
    @Query() filters: FilterFreightJobsDto,
  ): Promise<PaginatedResponseDto<FreightJobResponseDto>> {
    return this.freightJobsService.findByCarrierId(carrierId, filters);
  }

  /**
   * Update a freight job
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a freight job',
    description: 'Only the job shipper can update the job',
  })
  @ApiResponse({
    status: 200,
    description: 'Freight job updated successfully',
    type: FreightJobResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or status transition' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized' })
  @ApiResponse({ status: 404, description: 'Freight job not found' })
  async update(
    @Param('id') id: string,
    @Body() updateFreightJobDto: UpdateFreightJobDto,
    @Request() req: any, // Placeholder for auth user
  ): Promise<FreightJobResponseDto> {
    const userId = req.user?.id || req.user?.sub;
    const userRole = req.user?.role || 'shipper'; // Adjust based on your auth structure
    return this.freightJobsService.update(
      id,
      updateFreightJobDto,
      userId,
      userRole,
    );
  }

  /**
   * Assign a carrier to a job
   */
  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign a carrier to a freight job',
    description: 'Only the shipper can assign a carrier. Job must be in POSTED status',
  })
  @ApiResponse({
    status: 200,
    description: 'Carrier assigned successfully',
    type: FreightJobResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid job status for assignment' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized' })
  @ApiResponse({ status: 404, description: 'Freight job not found' })
  async assignCarrier(
    @Param('id') id: string,
    @Body() assignCarrierDto: AssignCarrierDto,
    @Request() req: any, // Placeholder for auth user
  ): Promise<FreightJobResponseDto> {
    const userId = req.user?.id || req.user?.sub;
    const userRole = req.user?.role || 'shipper';
    return this.freightJobsService.assignCarrier(
      id,
      assignCarrierDto,
      userId,
      userRole,
    );
  }

  /**
   * Delete a freight job (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a freight job',
    description: 'Only the shipper can delete the job. Job must be in DRAFT status',
  })
  @ApiResponse({ status: 204, description: 'Freight job deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete job not in DRAFT status' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized' })
  @ApiResponse({ status: 404, description: 'Freight job not found' })
  async remove(
    @Param('id') id: string,
    @Request() req: any, // Placeholder for auth user
  ): Promise<void> {
    const userId = req.user?.id || req.user?.sub;
    const userRole = req.user?.role || 'shipper';
    return this.freightJobsService.remove(id, userId, userRole);
  }
}
