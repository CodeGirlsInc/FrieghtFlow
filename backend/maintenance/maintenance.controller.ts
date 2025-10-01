import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';

// In a real app, carrierId would come from a JWT or a role-based access guard.
// For simplicity, we'll pass it as a URL parameter.
@Controller('carriers/:carrierId/maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Param('carrierId') carrierId: string, @Body() createDto: CreateMaintenanceRequestDto) {
    return this.maintenanceService.create(carrierId, createDto);
  }

  @Get()
  findAll(@Param('carrierId') carrierId: string) {
    return this.maintenanceService.findAllForCarrier(carrierId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Param('carrierId') carrierId: string) {
    return this.maintenanceService.findOne(id, carrierId);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Param('id') id: string,
    @Param('carrierId') carrierId: string,
    @Body() updateDto: UpdateMaintenanceRequestDto,
  ) {
    return this.maintenanceService.update(id, carrierId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Param('carrierId') carrierId: string) {
    return this.maintenanceService.remove(id, carrierId);
  }
}