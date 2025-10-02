import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MaintenanceService } from '../services/maintenance.service';
import { CreateMaintenanceDto, MaintenanceStatus } from '../dto/create-maintenance.dto';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  create(@Body() createMaintenanceDto: CreateMaintenanceDto) {
    return this.maintenanceService.create(createMaintenanceDto);
  }

  @Get()
  findAll(@Query('vehicleId') vehicleId?: string) {
    return this.maintenanceService.findAll(vehicleId);
  }

  @Get('upcoming')
  findUpcoming(@Query('days') days?: number) {
    return this.maintenanceService.findUpcoming(days ? Number(days) : 30);
  }

  @Get('history/:vehicleId')
  getHistory(@Param('vehicleId') vehicleId: string) {
    return this.maintenanceService.getMaintenanceHistory(vehicleId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: MaintenanceStatus; completedDate?: Date },
  ) {
    return this.maintenanceService.updateStatus(id, body.status, body.completedDate);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(id);
  }
}