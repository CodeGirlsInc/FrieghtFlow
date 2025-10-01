import { Injectable } from '@nestjs/common';
import { BaseRule } from './base-rule';
import { Route } from '../entities/route.entity';
import { Carrier } from '../entities/carrier.entity';
import { OptimizeRouteDto } from '../dto/optimize-route.dto';

@Injectable()
export class CarbonFootprintRule extends BaseRule {
  name = 'Carbon Footprint';
  description = 'Evaluates routes based on environmental impact';
  priority = 5;

  evaluate(route: Route, carriers: Carrier[], request: OptimizeRouteDto): any {
    const carbonFootprint = route.carbonFootprint;
    const maxCarbon = request.maxCarbonFootprint;
    
    // Check if route meets carbon footprint constraints
    if (maxCarbon && carbonFootprint > maxCarbon) {
      return this.createResult(
        false,
        0,
        `Route carbon footprint (${carbonFootprint}kg) exceeds maximum allowed (${maxCarbon}kg)`
      );
    }

    // Calculate carbon footprint score (lower is better)
    const allRoutes = [route, ...carriers.flatMap(c => c.metadata?.routes || [])];
    const carbonFootprints = allRoutes.map(r => r.carbonFootprint || 0);
    const minCarbon = Math.min(...carbonFootprints);
    const maxCarbonValue = Math.max(...carbonFootprints);
    
    const carbonScore = this.calculateScore(carbonFootprint, minCarbon, maxCarbonValue, true);
    
    return this.createResult(
      true,
      carbonScore,
      `Route carbon footprint: ${carbonFootprint}kg, Score: ${carbonScore.toFixed(2)}`,
      { carbonFootprint, carbonScore }
    );
  }
}
