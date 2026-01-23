import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ShipmentTrackingService } from './shipment-tracking.service';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { TrackingEventResponseDto } from './dto/tracking-event-response.dto';

@ApiTags('Shipment Tracking')
@ApiBearerAuth()
@Controller('api/v1/tracking/shipments')
export class ShipmentTrackingController {
  constructor(
    private readonly shipmentTrackingService: ShipmentTrackingService,
  ) {}

  @Post(':id/location')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add new tracking event with location' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({
    status: 201,
    description: 'Tracking event created successfully',
    type: TrackingEventResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createTrackingEvent(
    @Param('id', ParseUUIDPipe) shipmentId: string,
    @Body() createDto: CreateTrackingEventDto,
  ) {
    return await this.shipmentTrackingService.createTrackingEvent(
      shipmentId,
      createDto,
    );
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get complete tracking history for a shipment' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Tracking history retrieved successfully',
    type: [TrackingEventResponseDto],
  })
  @ApiResponse({ status: 404, description: 'No tracking history found' })
  async getTrackingHistory(@Param('id', ParseUUIDPipe) shipmentId: string) {
    return await this.shipmentTrackingService.getTrackingHistory(shipmentId);
  }

  @Get(':id/current-location')
  @ApiOperation({ summary: 'Get current location of a shipment' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Current location retrieved successfully',
    type: TrackingEventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No location data found' })
  async getCurrentLocation(@Param('id', ParseUUIDPipe) shipmentId: string) {
    return await this.shipmentTrackingService.getCurrentLocation(shipmentId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update shipment status' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Shipment status updated successfully',
    type: TrackingEventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async updateShipmentStatus(
    @Param('id', ParseUUIDPipe) shipmentId: string,
    @Body() updateDto: UpdateShipmentStatusDto,
    // @CurrentUser() user: User, // Implement your auth decorator
  ) {
    // Replace with actual user from auth
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    return await this.shipmentTrackingService.updateShipmentStatus(
      shipmentId,
      updateDto,
      userId,
    );
  }
}


import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
