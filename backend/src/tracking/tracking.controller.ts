import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';
import { TrackingEvent } from './tracking-event.entity';

@ApiTags('tracking')
@Controller()
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('tracking')
  @ApiOperation({ summary: 'Create a tracking event for a shipment' })
  @ApiResponse({ status: 201, description: 'Tracking event created', type: TrackingEvent })
  async create(@Body() dto: CreateTrackingEventDto): Promise<TrackingEvent> {
    return this.trackingService.create(dto);
  }

  @Get('shipments/:id/tracking')
  @ApiOperation({ summary: 'Get tracking events for a shipment in chronological order' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiResponse({ status: 200, description: 'List of tracking events', type: [TrackingEvent] })
  async list(@Param('id') shipmentId: string): Promise<TrackingEvent[]> {
    return this.trackingService.findByShipment(shipmentId);
  }
}
