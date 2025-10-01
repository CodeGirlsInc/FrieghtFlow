import { Injectable } from '@nestjs/common';
import { RouteRule, RuleResult } from './rule.interface';
import { Route } from '../entities/route.entity';
import { Carrier } from '../entities/carrier.entity';
import { OptimizeRouteDto } from '../dto/optimize-route.dto';

@Injectable()
export abstract class BaseRule implements RouteRule {
  abstract name: string;
  abstract description: string;
  abstract priority: number;

  abstract evaluate(route: Route, carriers: Carrier[], request: OptimizeRouteDto): RuleResult;

  protected createResult(passed: boolean, score: number, message: string, metadata?: Record<string, any>): RuleResult {
    return {
      passed,
      score,
      message,
      metadata,
    };
  }

  protected calculateScore(value: number, min: number, max: number, reverse: boolean = false): number {
    if (min === max) return 100;
    
    const normalized = (value - min) / (max - min);
    const score = reverse ? 1 - normalized : normalized;
    return Math.max(0, Math.min(100, score * 100));
  }

  protected isWithinRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }
}
