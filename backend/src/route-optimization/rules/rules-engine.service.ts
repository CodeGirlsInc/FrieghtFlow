import { Injectable } from '@nestjs/common';
import { RouteRule, RuleResult, RuleContext } from './rule.interface';
import { Route } from '../entities/route.entity';
import { Carrier } from '../entities/carrier.entity';
import { OptimizeRouteDto } from '../dto/optimize-route.dto';
import { CostOptimizationRule } from './cost-optimization.rule';
import { TimeOptimizationRule } from './time-optimization.rule';
import { ReliabilityRule } from './reliability.rule';
import { SafetyRule } from './safety.rule';
import { CarbonFootprintRule } from './carbon-footprint.rule';
import { CarrierAvailabilityRule } from './carrier-availability.rule';

export interface OptimizationResult {
  route: Route;
  totalScore: number;
  ruleResults: RuleResult[];
  passed: boolean;
  metadata: Record<string, any>;
}

@Injectable()
export class RulesEngineService {
  private rules: RouteRule[];

  constructor(
    private costRule: CostOptimizationRule,
    private timeRule: TimeOptimizationRule,
    private reliabilityRule: ReliabilityRule,
    private safetyRule: SafetyRule,
    private carbonRule: CarbonFootprintRule,
    private carrierRule: CarrierAvailabilityRule,
  ) {
    this.rules = [
      this.costRule,
      this.timeRule,
      this.reliabilityRule,
      this.safetyRule,
      this.carbonRule,
      this.carrierRule,
    ].sort((a, b) => a.priority - b.priority);
  }

  evaluateRoute(route: Route, carriers: Carrier[], request: OptimizeRouteDto): OptimizationResult {
    const ruleResults: RuleResult[] = [];
    let totalScore = 0;
    let passed = true;
    const metadata: Record<string, any> = {};

    // Evaluate each rule
    for (const rule of this.rules) {
      try {
        const result = rule.evaluate(route, carriers, request);
        ruleResults.push({
          ...result,
          metadata: { ...result.metadata, ruleName: rule.name }
        });

        if (!result.passed) {
          passed = false;
        }

        totalScore += result.score;
        metadata[rule.name.toLowerCase().replace(/\s+/g, '_')] = result;
      } catch (error) {
        const errorResult: RuleResult = {
          passed: false,
          score: 0,
          message: `Error evaluating rule ${rule.name}: ${error.message}`,
          metadata: { error: error.message, ruleName: rule.name }
        };
        ruleResults.push(errorResult);
        passed = false;
      }
    }

    // Calculate weighted average score
    const averageScore = ruleResults.length > 0 ? totalScore / ruleResults.length : 0;

    return {
      route,
      totalScore: averageScore,
      ruleResults,
      passed,
      metadata: {
        ...metadata,
        averageScore,
        totalRules: ruleResults.length,
        passedRules: ruleResults.filter(r => r.passed).length,
        failedRules: ruleResults.filter(r => !r.passed).length
      }
    };
  }

  evaluateRoutes(routes: Route[], carriers: Carrier[], request: OptimizeRouteDto): OptimizationResult[] {
    return routes.map(route => this.evaluateRoute(route, carriers, request));
  }

  getBestRoutes(routes: Route[], carriers: Carrier[], request: OptimizeRouteDto, limit: number = 5): OptimizationResult[] {
    const results = this.evaluateRoutes(routes, carriers, request);
    
    // Filter out failed routes if strict mode is enabled
    const validResults = request.constraints?.strictMode ? 
      results.filter(r => r.passed) : 
      results;

    // Sort by total score (descending) and return top results
    return validResults
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  }

  getRuleByName(name: string): RouteRule | undefined {
    return this.rules.find(rule => rule.name === name);
  }

  getAllRules(): RouteRule[] {
    return [...this.rules];
  }

  addCustomRule(rule: RouteRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  removeCustomRule(ruleName: string): boolean {
    const index = this.rules.findIndex(rule => rule.name === ruleName);
    if (index > -1) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }
}
