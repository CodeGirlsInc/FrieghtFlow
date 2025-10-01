import { Injectable } from '@nestjs/common';
import { BaseRule } from './base-rule';
import { Route } from '../entities/route.entity';
import { Carrier } from '../entities/carrier.entity';
import { OptimizeRouteDto } from '../dto/optimize-route.dto';

@Injectable()
export class CarrierAvailabilityRule extends BaseRule {
  name = 'Carrier Availability';
  description = 'Evaluates routes based on carrier availability and capabilities';
  priority = 6;

  evaluate(route: Route, carriers: Carrier[], request: OptimizeRouteDto): any {
    const preferredCarriers = request.preferredCarriers || [];
    const cargoType = request.cargoType;
    const weight = request.weight;
    const volume = request.volume;

    // Filter available carriers
    const availableCarriers = carriers.filter(carrier => 
      carrier.isActive && 
      carrier.status === 'active' &&
      this.isCarrierSuitable(carrier, cargoType, weight, volume)
    );

    if (availableCarriers.length === 0) {
      return this.createResult(
        false,
        0,
        'No suitable carriers available for this route'
      );
    }

    // Check if preferred carriers are available
    const preferredAvailable = availableCarriers.filter(carrier => 
      preferredCarriers.includes(carrier.id)
    );

    let carrierScore = 50; // Base score
    let message = `Found ${availableCarriers.length} suitable carriers`;

    if (preferredAvailable.length > 0) {
      carrierScore = 90;
      message += `, ${preferredAvailable.length} preferred carriers available`;
    }

    // Calculate average carrier scores
    const avgReliability = availableCarriers.reduce((sum, c) => sum + c.reliabilityScore, 0) / availableCarriers.length;
    const avgSafety = availableCarriers.reduce((sum, c) => sum + c.safetyScore, 0) / availableCarriers.length;
    const avgCost = availableCarriers.reduce((sum, c) => sum + c.costScore, 0) / availableCarriers.length;

    const finalScore = (carrierScore + avgReliability + avgSafety + avgCost) / 4;

    return this.createResult(
      true,
      finalScore,
      message,
      { 
        availableCarriers: availableCarriers.length,
        preferredAvailable: preferredAvailable.length,
        avgReliability,
        avgSafety,
        avgCost
      }
    );
  }

  private isCarrierSuitable(carrier: Carrier, cargoType?: string, weight?: number, volume?: number): boolean {
    // Check cargo type compatibility
    if (cargoType && carrier.capabilities?.cargoTypes) {
      const supportedTypes = carrier.capabilities.cargoTypes as string[];
      if (!supportedTypes.includes(cargoType)) {
        return false;
      }
    }

    // Check weight capacity
    if (weight && carrier.capabilities?.maxWeight) {
      if (weight > carrier.capabilities.maxWeight) {
        return false;
      }
    }

    // Check volume capacity
    if (volume && carrier.capabilities?.maxVolume) {
      if (volume > carrier.capabilities.maxVolume) {
        return false;
      }
    }

    return true;
  }
}
