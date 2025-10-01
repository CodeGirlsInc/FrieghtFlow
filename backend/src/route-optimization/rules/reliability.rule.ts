import { Injectable } from '@nestjs/common';
import { BaseRule } from './base-rule';
import { Route } from '../entities/route.entity';
import { Carrier } from '../entities/carrier.entity';
import { OptimizeRouteDto } from '../dto/optimize-route.dto';

@Injectable()
export class ReliabilityRule extends BaseRule {
  name = 'Reliability';
  description = 'Evaluates routes based on reliability score';
  priority = 3;

  evaluate(route: Route, carriers: Carrier[], request: OptimizeRouteDto): any {
    const reliabilityScore = route.reliabilityScore;
    const minReliability = request.minReliabilityScore;
    
    // Check if route meets reliability constraints
    if (minReliability && reliabilityScore < minReliability) {
      return this.createResult(
        false,
        0,
        `Route reliability (${reliabilityScore}) is below minimum required (${minReliability})`
      );
    }

    // Calculate reliability score
    const reliabilityScoreValue = reliabilityScore || 0;
    
    return this.createResult(
      true,
      reliabilityScoreValue,
      `Route reliability: ${reliabilityScoreValue}`,
      { reliabilityScore: reliabilityScoreValue }
    );
  }
}
