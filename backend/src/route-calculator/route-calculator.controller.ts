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
  origin: { latitude: number; longitude: number } | string;
  destination: { latitude: number; longitude: number } | string;
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

    const shipmentData = shipment as unknown as ShipmentWithCoords;
    const { origin, destination, weightKg } = shipmentData;

    const originCoords = typeof origin === 'string' ? null : origin;
    const destinationCoords =
      typeof destination === 'string' ? null : destination;

    if (
      !originCoords?.latitude ||
      !originCoords?.longitude ||
      !destinationCoords?.latitude ||
      !destinationCoords?.longitude
    ) {
      throw new UnprocessableEntityException(
        'Shipment is missing coordinates on either the origin or destination',
      );
    }

    const originPair: [number, number] = [
      originCoords.latitude,
      originCoords.longitude,
    ];
    const destinationPair: [number, number] = [
      destinationCoords.latitude,
      destinationCoords.longitude,
    ];

    const distanceKm = this.routeCalculatorService.calculateDistance(
      originPair,
      destinationPair,
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
