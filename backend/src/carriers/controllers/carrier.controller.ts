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
  HttpStatus,
} from '@nestjs/common';
import { CarrierService } from '../services/carrier.service';
import { CreateCarrierDto } from '../dto/create-carrier.dto';
import { UpdateCarrierDto } from '../dto/update-carrier.dto';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { CreateRatingDto } from '../dto/create-rating.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('carriers')
@Controller('carriers')
export class CarrierController {
  constructor(private readonly carrierService: CarrierService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new carrier' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Carrier has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'License number already exists.',
  })
  async create(@Body() createCarrierDto: CreateCarrierDto) {
    return await this.carrierService.create(createCarrierDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all carriers' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all carriers.',
  })
  async findAll(
    @Query('serviceArea') serviceArea?: string,
    @Query('minRating') minRating?: number,
    @Query('isVerified') isVerified?: boolean,
    @Query('searchTerm') searchTerm?: string,
  ) {
    const filters = {
      serviceArea,
      minRating: minRating ? Number(minRating) : undefined,
      isVerified: isVerified !== undefined ? Boolean(isVerified) : undefined,
      searchTerm,
    };

    return await this.carrierService.searchCarriers(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a carrier by ID' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the carrier.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrier not found.',
  })
  async findOne(@Param('id') id: string) {
    return await this.carrierService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a carrier' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Carrier has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrier not found.',
  })
  async update(@Param('id') id: string, @Body() updateCarrierDto: UpdateCarrierDto) {
    return await this.carrierService.update(id, updateCarrierDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a carrier' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Carrier has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrier not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete carrier with active vehicles.',
  })
  async remove(@Param('id') id: string) {
    await this.carrierService.remove(id);
    return { message: 'Carrier deleted successfully' };
  }

  // Vehicle routes
  @Post(':id/vehicles')
  @ApiOperation({ summary: 'Add a vehicle to a carrier' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Vehicle has been successfully added to the carrier.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrier not found.',
  })
  async addVehicle(
    @Param('id') carrierId: string,
    @Body() createVehicleDto: CreateVehicleDto,
  ) {
    return await this.carrierService.createVehicle(carrierId, createVehicleDto);
  }

  @Get(':id/vehicles')
  @ApiOperation({ summary: 'Get all vehicles for a carrier' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all vehicles for the carrier.',
  })
  async getVehicles(@Param('id') carrierId: string) {
    return await this.carrierService.getVehiclesByCarrier(carrierId);
  }

  @Patch('vehicles/:vehicleId')
  @ApiOperation({ summary: 'Update a vehicle' })
  @ApiParam({ name: 'vehicleId', description: 'Vehicle ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vehicle has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vehicle not found.',
  })
  async updateVehicle(
    @Param('vehicleId') vehicleId: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return await this.carrierService.updateVehicle(vehicleId, updateVehicleDto);
  }

  @Delete('vehicles/:vehicleId')
  @ApiOperation({ summary: 'Delete a vehicle' })
  @ApiParam({ name: 'vehicleId', description: 'Vehicle ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Vehicle has been successfully removed.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vehicle not found.',
  })
  async deleteVehicle(@Param('vehicleId') vehicleId: string) {
    await this.carrierService.deleteVehicle(vehicleId);
    return { message: 'Vehicle deleted successfully' };
  }

  // Performance and rating routes
  @Get(':id/performance')
  @ApiOperation({ summary: 'Get carrier performance metrics' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return carrier performance metrics.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrier not found.',
  })
  async getPerformance(@Param('id') id: string) {
    return await this.carrierService.getPerformanceMetrics(id);
  }

  @Post(':id/rate')
  @ApiOperation({ summary: 'Rate a carrier' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Carrier has been successfully rated.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Rating already exists for this job.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carrier not found.',
  })
  async rateCarrier(@Param('id') carrierId: string, @Body() createRatingDto: CreateRatingDto) {
    return await this.carrierService.rateCarrier({ ...createRatingDto, carrierId });
  }
}