import { Controller, Post, Body, Put, Param, Get } from '@nestjs/common';
import { TrackingSystemService } from './tracking-system.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { Shipment } from './entities/shipment.entity';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

@Controller('shipments')
export class TrackingSystemController {
  constructor(private readonly trackingService: TrackingSystemService) {}

  @Post()
  create(@Body() createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    return this.trackingService.create(createShipmentDto);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateShipmentStatusDto,
  ): Promise<Shipment> {
    return this.trackingService.updateStatus(id, updateStatusDto);
  }

  @Get(':id')
  getShipment(@Param('id') id: string): Promise<Shipment> {
    return this.trackingService.getShipment(id);
  }
}
