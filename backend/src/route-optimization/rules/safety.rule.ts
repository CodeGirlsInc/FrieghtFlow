import { Injectable } from '@nestjs/common';
import { BaseRule } from './base-rule';
import { Route } from '../entities/route.entity';
import { Carrier } from '../entities/carrier.entity';
import { OptimizeRouteDto } from '../dto/optimize-route.dto';

@Injectable()
export class SafetyRule extends BaseRule {
  name = 'Safety';
  description = 'Evaluates routes based on safety score';
  priority = 4;

  evaluate(route: Route, carriers: Carrier[], request: OptimizeRouteDto): any {
    const safetyScore = route.safetyScore;
    const minSafety = request.minSafetyScore;
    
    // Check if route meets safety constraints
    if (minSafety && safetyScore < minSafety) {
      return this.createResult(
        false,
        0,
        `Route safety (${safetyScore}) is below minimum required (${minSafety})`
      );
    }

    // Calculate safety score
    const safetyScoreValue = safetyScore || 0;
    
    return this.createResult(
      true,
      safetyScoreValue,
      `Route safety: ${safetyScoreValue}`,
      { safetyScore: safetyScoreValue }
    );
  }
}
