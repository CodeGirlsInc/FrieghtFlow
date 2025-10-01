import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VehicleService } from '../services/vehicle.service';
import { CreateVehicleDto, VehicleType } from '../dto/create-vehicle.dto';
import { UpdateVehicleStatusDto } from '../dto/update-vehicle-status.dto';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.create(createVehicleDto);
  }

  @Get()
  findAll(@Query('carrierId') carrierId?: string) {
    return this.vehicleService.findAll(carrierId);
  }

  @Get('available')
  findAvailable(
    @Query('type') type?: VehicleType,
    @Query('minCapacity') minCapacity?: number,
  ) {
    return this.vehicleService.findAvailable(type, minCapacity);
  }

  @Get('statistics/:carrierId')
  getFleetStatistics(@Param('carrierId') carrierId: string) {
    return this.vehicleService.getFleetStatistics(carrierId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateVehicleStatusDto) {
    return this.vehicleService.updateStatus(id, updateStatusDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleDto: Partial<CreateVehicleDto>) {
    return this.vehicleService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehicleService.remove(id);
  }
}
