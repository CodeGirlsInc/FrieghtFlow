import { Injectable } from '@nestjs/common';
import { BaseRule } from './base-rule';
import { Route } from '../entities/route.entity';
import { Carrier } from '../entities/carrier.entity';
import { OptimizeRouteDto } from '../dto/optimize-route.dto';

@Injectable()
export class CostOptimizationRule extends BaseRule {
  name = 'Cost Optimization';
  description = 'Evaluates routes based on cost efficiency';
  priority = 1;

  evaluate(route: Route, carriers: Carrier[], request: OptimizeRouteDto): any {
    const baseCost = route.baseCost;
    const maxCost = request.maxCost;
    
    // Check if route meets cost constraints
    if (maxCost && baseCost > maxCost) {
      return this.createResult(
        false,
        0,
        `Route cost (${baseCost}) exceeds maximum allowed cost (${maxCost})`
      );
    }

    // Calculate cost score based on available routes
    const allRoutes = [route, ...carriers.flatMap(c => c.metadata?.routes || [])];
    const costs = allRoutes.map(r => r.baseCost || 0);
    const minCost = Math.min(...costs);
    const maxCostValue = Math.max(...costs);
    
    const costScore = this.calculateScore(baseCost, minCost, maxCostValue, true);
    
    return this.createResult(
      true,
      costScore,
      `Route cost: ${baseCost}, Score: ${costScore.toFixed(2)}`,
      { baseCost, costScore }
    );
  }
}
