import { Injectable } from '@nestjs/common';
import { BaseRule } from './base-rule';
import { Route } from '../entities/route.entity';
import { Carrier } from '../entities/carrier.entity';
import { OptimizeRouteDto } from '../dto/optimize-route.dto';

@Injectable()
export class TimeOptimizationRule extends BaseRule {
  name = 'Time Optimization';
  description = 'Evaluates routes based on delivery time';
  priority = 2;

  evaluate(route: Route, carriers: Carrier[], request: OptimizeRouteDto): any {
    const estimatedDuration = route.estimatedDuration;
    const maxDuration = request.maxDuration;
    
    // Check if route meets time constraints
    if (maxDuration && estimatedDuration > maxDuration) {
      return this.createResult(
        false,
        0,
        `Route duration (${estimatedDuration}h) exceeds maximum allowed duration (${maxDuration}h)`
      );
    }

    // Calculate time score based on available routes
    const allRoutes = [route, ...carriers.flatMap(c => c.metadata?.routes || [])];
    const durations = allRoutes.map(r => r.estimatedDuration || 0);
    const minDuration = Math.min(...durations);
    const maxDurationValue = Math.max(...durations);
    
    const timeScore = this.calculateScore(estimatedDuration, minDuration, maxDurationValue, true);
    
    return this.createResult(
      true,
      timeScore,
      `Route duration: ${estimatedDuration}h, Score: ${timeScore.toFixed(2)}`,
      { estimatedDuration, timeScore }
    );
  }
}
