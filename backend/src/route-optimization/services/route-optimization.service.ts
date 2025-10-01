import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from '../entities/route.entity';
import { RouteSegment } from '../entities/route-segment.entity';
import { Carrier } from '../entities/carrier.entity';
import { RouteOptimizationRequest, OptimizationStatus } from '../entities/route-optimization-request.entity';
import { OptimizeRouteDto } from '../dto/optimize-route.dto';
import { RouteOptimizationResultDto } from '../dto/route-optimization-result.dto';
import { RulesEngineService, OptimizationResult } from '../rules/rules-engine.service';
import { OptimizationAlgorithm } from '../entities/route.entity';

@Injectable()
export class RouteOptimizationService {
  constructor(
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(RouteSegment)
    private segmentRepository: Repository<RouteSegment>,
    @InjectRepository(Carrier)
    private carrierRepository: Repository<Carrier>,
    @InjectRepository(RouteOptimizationRequest)
    private optimizationRequestRepository: Repository<RouteOptimizationRequest>,
    private rulesEngine: RulesEngineService,
  ) {}

  async optimizeRoute(request: OptimizeRouteDto, requesterId: string): Promise<RouteOptimizationResultDto> {
    // Create optimization request record
    const optimizationRequest = this.optimizationRequestRepository.create({
      requesterId,
      origin: request.origin,
      destination: request.destination,
      criteria: request.criteria,
      weight: request.weight,
      volume: request.volume,
      cargoType: request.cargoType,
      constraints: request.constraints,
      preferences: request.preferences,
      metadata: request.metadata,
      status: OptimizationStatus.PROCESSING,
    });

    await this.optimizationRequestRepository.save(optimizationRequest);

    try {
      // Find available routes
      const availableRoutes = await this.findAvailableRoutes(request);
      
      if (availableRoutes.length === 0) {
        throw new NotFoundException('No routes found for the specified origin and destination');
      }

      // Get available carriers
      const carriers = await this.getAvailableCarriers(request);

      // Apply optimization algorithm
      const optimizationResults = await this.applyOptimizationAlgorithm(
        availableRoutes,
        carriers,
        request
      );

      if (optimizationResults.length === 0) {
        throw new BadRequestException('No suitable routes found based on the specified criteria');
      }

      // Get the best route
      const bestRoute = optimizationResults[0];
      const route = bestRoute.route;

      // Update optimization request with results
      await this.optimizationRequestRepository.update(optimizationRequest.id, {
        status: OptimizationStatus.COMPLETED,
        routeId: route.id,
        optimizedCost: route.baseCost,
        optimizedDistance: route.totalDistance,
        optimizedDuration: route.estimatedDuration,
        optimizedCarbonFootprint: route.carbonFootprint,
        optimizedReliabilityScore: route.reliabilityScore,
        optimizedSafetyScore: route.safetyScore,
        results: {
          totalScore: bestRoute.totalScore,
          ruleResults: bestRoute.ruleResults,
          metadata: bestRoute.metadata,
        },
      });

      // Build result DTO
      const result = await this.buildOptimizationResult(route, bestRoute, carriers);

      return result;
    } catch (error) {
      // Update request with error
      await this.optimizationRequestRepository.update(optimizationRequest.id, {
        status: OptimizationStatus.FAILED,
        errorMessage: error.message,
      });

      throw error;
    }
  }

  private async findAvailableRoutes(request: OptimizeRouteDto): Promise<Route[]> {
    const query = this.routeRepository
      .createQueryBuilder('route')
      .leftJoinAndSelect('route.segments', 'segments')
      .where('route.origin = :origin', { origin: request.origin })
      .andWhere('route.destination = :destination', { destination: request.destination })
      .andWhere('route.isActive = :isActive', { isActive: true })
      .andWhere('route.status = :status', { status: 'active' });

    // Apply constraints
    if (request.maxCost) {
      query.andWhere('route.baseCost <= :maxCost', { maxCost: request.maxCost });
    }

    if (request.maxDuration) {
      query.andWhere('route.estimatedDuration <= :maxDuration', { maxDuration: request.maxDuration });
    }

    if (request.maxDistance) {
      query.andWhere('route.totalDistance <= :maxDistance', { maxDistance: request.maxDistance });
    }

    if (request.minReliabilityScore) {
      query.andWhere('route.reliabilityScore >= :minReliability', { minReliability: request.minReliabilityScore });
    }

    if (request.minSafetyScore) {
      query.andWhere('route.safetyScore >= :minSafety', { minSafety: request.minSafetyScore });
    }

    if (request.maxCarbonFootprint) {
      query.andWhere('route.carbonFootprint <= :maxCarbon', { maxCarbon: request.maxCarbonFootprint });
    }

    return await query.getMany();
  }

  private async getAvailableCarriers(request: OptimizeRouteDto): Promise<Carrier[]> {
    const query = this.carrierRepository
      .createQueryBuilder('carrier')
      .where('carrier.isActive = :isActive', { isActive: true })
      .andWhere('carrier.status = :status', { status: 'active' });

    // Filter by preferred carriers if specified
    if (request.preferredCarriers && request.preferredCarriers.length > 0) {
      query.andWhere('carrier.id IN (:...preferredCarriers)', { preferredCarriers: request.preferredCarriers });
    }

    return await query.getMany();
  }

  private async applyOptimizationAlgorithm(
    routes: Route[],
    carriers: Carrier[],
    request: OptimizeRouteDto
  ): Promise<OptimizationResult[]> {
    // Use rules engine to evaluate routes
    const results = this.rulesEngine.evaluateRoutes(routes, carriers, request);

    // Apply additional algorithm-specific optimizations
    const algorithm = request.preferences?.algorithm || OptimizationAlgorithm.DIJKSTRA;
    
    switch (algorithm) {
      case OptimizationAlgorithm.DIJKSTRA:
        return this.applyDijkstraOptimization(results, request);
      case OptimizationAlgorithm.A_STAR:
        return this.applyAStarOptimization(results, request);
      case OptimizationAlgorithm.GENETIC:
        return this.applyGeneticOptimization(results, request);
      case OptimizationAlgorithm.SIMULATED_ANNEALING:
        return this.applySimulatedAnnealingOptimization(results, request);
      case OptimizationAlgorithm.ANT_COLONY:
        return this.applyAntColonyOptimization(results, request);
      default:
        return results.sort((a, b) => b.totalScore - a.totalScore);
    }
  }

  private applyDijkstraOptimization(results: OptimizationResult[], request: OptimizeRouteDto): OptimizationResult[] {
    // Dijkstra-like optimization: prioritize shortest path (distance + cost)
    return results
      .map(result => ({
        ...result,
        totalScore: result.totalScore * 0.7 + this.calculateDistanceScore(result.route) * 0.3
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  private applyAStarOptimization(results: OptimizationResult[], request: OptimizeRouteDto): OptimizationResult[] {
    // A* optimization: combine current cost with heuristic (estimated remaining cost)
    return results
      .map(result => {
        const heuristic = this.calculateHeuristic(result.route, request);
        return {
          ...result,
          totalScore: result.totalScore * 0.6 + heuristic * 0.4
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  private applyGeneticOptimization(results: OptimizationResult[], request: OptimizeRouteDto): OptimizationResult[] {
    // Simplified genetic algorithm simulation
    const population = results.slice(0, 10); // Top 10 routes as initial population
    
    // Simulate crossover and mutation
    const optimized = population.map(result => ({
      ...result,
      totalScore: result.totalScore + (Math.random() - 0.5) * 10 // Add some variation
    }));

    return optimized.sort((a, b) => b.totalScore - a.totalScore);
  }

  private applySimulatedAnnealingOptimization(results: OptimizationResult[], request: OptimizeRouteDto): OptimizationResult[] {
    // Simulated annealing optimization
    const temperature = 100;
    const coolingRate = 0.95;
    
    let current = results[0];
    let best = current;
    
    for (let i = 0; i < 50; i++) {
      const neighbor = results[Math.floor(Math.random() * results.length)];
      const delta = neighbor.totalScore - current.totalScore;
      
      if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
        current = neighbor;
        if (current.totalScore > best.totalScore) {
          best = current;
        }
      }
      
      // Cool down
      temperature *= coolingRate;
    }
    
    return [best, ...results.filter(r => r !== best)];
  }

  private applyAntColonyOptimization(results: OptimizationResult[], request: OptimizeRouteDto): OptimizationResult[] {
    // Simplified ant colony optimization
    const pheromoneLevels = new Map<string, number>();
    
    // Initialize pheromone levels
    results.forEach(result => {
      pheromoneLevels.set(result.route.id, 1.0);
    });
    
    // Simulate ant movements
    for (let ant = 0; ant < 20; ant++) {
      const selectedRoute = this.selectRouteByPheromone(results, pheromoneLevels);
      const pheromone = pheromoneLevels.get(selectedRoute.route.id) || 0;
      pheromoneLevels.set(selectedRoute.route.id, pheromone + 0.1);
    }
    
    // Sort by pheromone levels
    return results.sort((a, b) => {
      const pheromoneA = pheromoneLevels.get(a.route.id) || 0;
      const pheromoneB = pheromoneLevels.get(b.route.id) || 0;
      return pheromoneB - pheromoneA;
    });
  }

  private calculateDistanceScore(route: Route): number {
    // Normalize distance score (lower distance = higher score)
    const maxDistance = 10000; // Assume max distance of 10,000 km
    return Math.max(0, (maxDistance - route.totalDistance) / maxDistance * 100);
  }

  private calculateHeuristic(route: Route, request: OptimizeRouteDto): number {
    // Calculate heuristic based on remaining distance and cost
    const distanceHeuristic = this.calculateDistanceScore(route);
    const costHeuristic = request.maxCost ? 
      Math.max(0, (request.maxCost - route.baseCost) / request.maxCost * 100) : 50;
    
    return (distanceHeuristic + costHeuristic) / 2;
  }

  private selectRouteByPheromone(results: OptimizationResult[], pheromoneLevels: Map<string, number>): OptimizationResult {
    const totalPheromone = Array.from(pheromoneLevels.values()).reduce((sum, level) => sum + level, 0);
    const random = Math.random() * totalPheromone;
    
    let current = 0;
    for (const result of results) {
      current += pheromoneLevels.get(result.route.id) || 0;
      if (current >= random) {
        return result;
      }
    }
    
    return results[0];
  }

  private async buildOptimizationResult(
    route: Route,
    optimizationResult: OptimizationResult,
    carriers: Carrier[]
  ): Promise<RouteOptimizationResultDto> {
    // Get route segments with carrier information
    const segments = await this.segmentRepository.find({
      where: { routeId: route.id },
      order: { sequence: 'ASC' }
    });

    const segmentResults = segments.map(segment => {
      // Find best carrier for this segment
      const suitableCarriers = carriers.filter(carrier => 
        this.isCarrierSuitableForSegment(carrier, segment)
      );

      const bestCarrier = suitableCarriers.length > 0 ? 
        suitableCarriers.reduce((best, current) => 
          (current.reliabilityScore + current.safetyScore) > 
          (best.reliabilityScore + best.safetyScore) ? current : best
        ) : null;

      return {
        segmentId: segment.id,
        segmentType: segment.segmentType,
        origin: segment.origin,
        destination: segment.destination,
        distance: segment.distance,
        duration: segment.duration,
        cost: segment.cost,
        currency: segment.currency,
        carbonFootprint: segment.carbonFootprint,
        reliabilityScore: segment.reliabilityScore,
        safetyScore: segment.safetyScore,
        carrier: bestCarrier ? {
          id: bestCarrier.id,
          name: bestCarrier.name,
          type: bestCarrier.carrierType,
          reliabilityScore: bestCarrier.reliabilityScore,
          safetyScore: bestCarrier.safetyScore,
          costScore: bestCarrier.costScore,
          speedScore: bestCarrier.speedScore,
        } : undefined,
      };
    });

    return {
      routeId: route.id,
      routeName: route.name,
      origin: route.origin,
      destination: route.destination,
      optimizedCost: route.baseCost,
      optimizedDistance: route.totalDistance,
      optimizedDuration: route.estimatedDuration,
      carbonFootprint: route.carbonFootprint,
      reliabilityScore: route.reliabilityScore,
      safetyScore: route.safetyScore,
      currency: route.currency,
      segments: segmentResults,
      metadata: optimizationResult.metadata,
    };
  }

  private isCarrierSuitableForSegment(carrier: Carrier, segment: RouteSegment): boolean {
    // Check if carrier supports the segment type
    const supportedTypes = carrier.capabilities?.segmentTypes as string[] || [];
    return supportedTypes.includes(segment.segmentType) || supportedTypes.length === 0;
  }

  async getOptimizationHistory(requesterId: string, limit: number = 10): Promise<RouteOptimizationRequest[]> {
    return await this.optimizationRequestRepository.find({
      where: { requesterId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getOptimizationRequest(id: string): Promise<RouteOptimizationRequest> {
    const request = await this.optimizationRequestRepository.findOne({
      where: { id },
      relations: ['route'],
    });

    if (!request) {
      throw new NotFoundException('Optimization request not found');
    }

    return request;
  }
}
