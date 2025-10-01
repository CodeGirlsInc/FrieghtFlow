import { Route } from '../entities/route.entity';
import { Carrier } from '../entities/carrier.entity';
import { OptimizeRouteDto } from '../dto/optimize-route.dto';

export interface RouteRule {
  name: string;
  description: string;
  priority: number;
  evaluate(route: Route, carriers: Carrier[], request: OptimizeRouteDto): RuleResult;
}

export interface RuleResult {
  passed: boolean;
  score: number; // 0-100
  message: string;
  metadata?: Record<string, any>;
}

export interface RuleContext {
  route: Route;
  carriers: Carrier[];
  request: OptimizeRouteDto;
  availableRoutes: Route[];
}
