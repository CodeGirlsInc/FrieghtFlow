import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ShipmentsService } from '../shipments/shipments.service';
import { RouteCalculatorService } from './route-calculator.service';

interface ShipmentWithCoords {
  origin: { latitude?: number; longitude?: number };
  destination: { latitude?: number; longitude?: number };
  weightKg: number;
}

@Controller('shipments')
export class RouteCalculatorController {
  constructor(
    private readonly shipmentsService: ShipmentsService,
    private readonly routeCalculatorService: RouteCalculatorService,
  ) {}

  @Get(':id/route-info')
  async getRouteInfo(@Param('id') id: string) {
    const shipment = await this.shipmentsService.findOne(id);

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const typed = shipment as unknown as ShipmentWithCoords;
    const { origin, destination, weightKg } = typed;

    if (
      !origin?.latitude ||
      !origin?.longitude ||
      !destination?.latitude ||
      !destination?.longitude
    ) {
      throw new UnprocessableEntityException(
        'Shipment is missing coordinates on either the origin or destination',
      );
    }

    const originCoords: [number, number] = [origin.latitude, origin.longitude];
    const destinationCoords: [number, number] = [
      destination.latitude,
      destination.longitude,
    ];

    const distanceKm = this.routeCalculatorService.calculateDistance(
      originCoords,
      destinationCoords,
    );
    const estimatedHours =
      this.routeCalculatorService.estimateDuration(distanceKm);
    const carbonEstimateKg =
      this.routeCalculatorService.estimateCarbonFootprint(
        distanceKm,
        weightKg / 1000,
      );

    return {
      distanceKm,
      estimatedHours,
      carbonEstimateKg,
    };
  }
}
