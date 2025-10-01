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
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CarrierService } from '../services/carrier.service';
import { CreateCarrierDto } from '../dto/create-carrier.dto';
import { UpdateCarrierDto } from '../dto/update-carrier.dto';
import { Carrier } from '../entities/carrier.entity';

@ApiTags('Carriers')
@Controller('carriers')
export class CarrierController {
  constructor(private readonly carrierService: CarrierService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new carrier' })
  @ApiResponse({
    status: 201,
    description: 'Carrier created successfully',
    type: Carrier,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid carrier data',
  })
  async create(@Body() createCarrierDto: CreateCarrierDto): Promise<Carrier> {
    return await this.carrierService.create(createCarrierDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all carriers with optional filtering' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', type: Number })
  @ApiQuery({ name: 'name', required: false, description: 'Filter by carrier name' })
  @ApiQuery({ name: 'carrierType', required: false, description: 'Filter by carrier type' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by carrier status' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Carriers retrieved successfully',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('name') name?: string,
    @Query('carrierType') carrierType?: string,
    @Query('status') status?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    const filters = {
      name,
      carrierType,
      status,
      isActive,
    };

    return await this.carrierService.findAll(page, limit, filters);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search carriers by name, description, or headquarters' })
  @ApiQuery({ name: 'q', description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: [Carrier],
  })
  async searchCarriers(@Query('q') searchTerm: string): Promise<Carrier[]> {
    return await this.carrierService.searchCarriers(searchTerm);
  }

  @Get('type/:carrierType')
  @ApiOperation({ summary: 'Get carriers by type' })
  @ApiParam({ name: 'carrierType', description: 'Carrier type' })
  @ApiResponse({
    status: 200,
    description: 'Carriers retrieved successfully',
    type: [Carrier],
  })
  async getCarriersByType(@Param('carrierType') carrierType: string): Promise<Carrier[]> {
    return await this.carrierService.getCarriersByType(carrierType);
  }

  @Get('service-area/:serviceArea')
  @ApiOperation({ summary: 'Get carriers by service area' })
  @ApiParam({ name: 'serviceArea', description: 'Service area code' })
  @ApiResponse({
    status: 200,
    description: 'Carriers retrieved successfully',
    type: [Carrier],
  })
  async getCarriersByServiceArea(@Param('serviceArea') serviceArea: string): Promise<Carrier[]> {
    return await this.carrierService.getCarriersByServiceArea(serviceArea);
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top performing carriers' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of carriers to return', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Top carriers retrieved successfully',
    type: [Carrier],
  })
  async getTopCarriers(@Query('limit') limit?: number): Promise<Carrier[]> {
    return await this.carrierService.getTopCarriers(limit);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get carrier statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics() {
    return await this.carrierService.getCarrierStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get carrier by ID' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  @ApiResponse({
    status: 200,
    description: 'Carrier retrieved successfully',
    type: Carrier,
  })
  @ApiResponse({
    status: 404,
    description: 'Carrier not found',
  })
  async findOne(@Param('id') id: string): Promise<Carrier> {
    return await this.carrierService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update carrier' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  @ApiResponse({
    status: 200,
    description: 'Carrier updated successfully',
    type: Carrier,
  })
  @ApiResponse({
    status: 404,
    description: 'Carrier not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCarrierDto: UpdateCarrierDto,
  ): Promise<Carrier> {
    return await this.carrierService.update(id, updateCarrierDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete carrier' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  @ApiResponse({
    status: 200,
    description: 'Carrier deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Carrier not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.carrierService.remove(id);
  }

  @Patch(':id/scores')
  @ApiOperation({ summary: 'Update carrier performance scores' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  @ApiResponse({
    status: 200,
    description: 'Carrier scores updated successfully',
    type: Carrier,
  })
  @ApiResponse({
    status: 404,
    description: 'Carrier not found',
  })
  async updateCarrierScores(
    @Param('id') id: string,
    @Body() scores: {
      reliabilityScore?: number;
      safetyScore?: number;
      costScore?: number;
      speedScore?: number;
    },
  ): Promise<Carrier> {
    return await this.carrierService.updateCarrierScores(id, scores);
  }
}
