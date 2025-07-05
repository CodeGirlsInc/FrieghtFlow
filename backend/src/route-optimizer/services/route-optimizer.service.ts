import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type Route, OptimizationCriteria, RouteStatus } from "../entities/route.entity"
import { type RouteCalculation, CalculationStatus } from "../entities/route-calculation.entity"
import type { MapDataService } from "./map-data.service"
import type {
  Coordinate,
  DijkstraResult,
  RouteCalculationOptions,
  RouteAlternative,
  GraphEdge,
} from "../interfaces/route-optimizer.interface"

@Injectable()
export class RouteOptimizerService {
  private readonly logger = new Logger(RouteOptimizerService.name)
  private readonly routeCache = new Map<string, Route>()
  private readonly CACHE_EXPIRATION_MINUTES = 30
  private readonly MAX_CACHE_SIZE = 10000

  constructor(
    private readonly routeRepository: Repository<Route>,
    private readonly routeCalculationRepository: Repository<RouteCalculation>,
    private readonly mapDataService: MapDataService,
  ) {}

  /**
   * Calculate optimal route between source and destination
   */
  async calculateRoute(
    source: Coordinate,
    destination: Coordinate,
    waypoints: Coordinate[] = [],
    options: RouteCalculationOptions = { optimizationCriteria: OptimizationCriteria.DISTANCE },
  ): Promise<Route> {
    const startTime = Date.now()
    const calculationId = await this.createCalculationRecord(source, destination, options)

    try {
      // Check cache first
      if (options.useCache !== false) {
        const cachedRoute = await this.getCachedRoute(source, destination, options)
        if (cachedRoute) {
          await this.updateCalculationRecord(calculationId, CalculationStatus.CACHED, Date.now() - startTime)
          return cachedRoute
        }
      }

      // Update calculation status
      await this.updateCalculationRecord(calculationId, CalculationStatus.IN_PROGRESS)

      // Find nearest nodes
      const sourceNode = this.mapDataService.findNearestNode(source)
      const destinationNode = this.mapDataService.findNearestNode(destination)

      if (!sourceNode || !destinationNode) {
        throw new Error("Could not find nearest nodes for source or destination")
      }

      // Calculate main route using Dijkstra's algorithm
      const dijkstraResult = await this.dijkstra(sourceNode.id, destinationNode.id, options)

      if (dijkstraResult.path.length === 0) {
        throw new Error("No route found between source and destination")
      }

      // Build route waypoints
      const routeWaypoints = await this.buildRouteWaypoints(dijkstraResult.path, waypoints)

      // Calculate route instructions
      const routeInstructions = await this.generateRouteInstructions(dijkstraResult.path)

      // Calculate alternatives if requested
      let alternativeRoutes: RouteAlternative[] = []
      if (options.includeAlternatives) {
        alternativeRoutes = await this.calculateAlternativeRoutes(sourceNode.id, destinationNode.id, options)
      }

      // Create route entity
      const route = this.routeRepository.create({
        sourceLatitude: source.latitude,
        sourceLongitude: source.longitude,
        destinationLatitude: destination.latitude,
        destinationLongitude: destination.longitude,
        waypoints: routeWaypoints,
        totalDistance: dijkstraResult.totalDistance,
        estimatedDuration: dijkstraResult.totalTime,
        estimatedCost: this.calculateRouteCost(dijkstraResult.path, options),
        optimizationCriteria: options.optimizationCriteria as OptimizationCriteria,
        status: RouteStatus.CALCULATED,
        alternativeRoutes: alternativeRoutes.map((alt) => ({
          id: alt.id,
          distance: alt.distance,
          duration: alt.duration,
          cost: alt.cost,
          description: alt.description,
        })),
        routeMetrics: {
          algorithmsUsed: ["dijkstra"],
          calculationTime: Date.now() - startTime,
          nodesEvaluated: dijkstraResult.nodesEvaluated,
          cacheHit: false,
        },
        routeInstructions,
        calculatedAt: new Date(),
        expiresAt: new Date(Date.now() + this.CACHE_EXPIRATION_MINUTES * 60 * 1000),
      })

      const savedRoute = await this.routeRepository.save(route)

      // Cache the route
      this.cacheRoute(savedRoute)

      // Update calculation record
      await this.updateCalculationRecord(
        calculationId,
        CalculationStatus.COMPLETED,
        Date.now() - startTime,
        dijkstraResult.nodesEvaluated,
        savedRoute.id,
      )

      this.logger.log(
        `Route calculated: ${dijkstraResult.totalDistance.toFixed(2)}km, ${dijkstraResult.totalTime}min, ${dijkstraResult.nodesEvaluated} nodes evaluated`,
      )

      return savedRoute
    } catch (error) {
      await this.updateCalculationRecord(
        calculationId,
        CalculationStatus.FAILED,
        Date.now() - startTime,
        0,
        null,
        error.message,
      )
      throw error
    }
  }

  /**
   * Dijkstra's algorithm implementation
   */
  private async dijkstra(
    sourceNodeId: string,
    destinationNodeId: string,
    options: RouteCalculationOptions,
  ): Promise<DijkstraResult> {
    const graph = this.mapDataService.getRouteGraph()
    const distances = new Map<string, number>()
    const previous = new Map<string, string | null>()
    const unvisited = new Set<string>()
    let nodesEvaluated = 0

    // Initialize distances
    for (const nodeId of graph.nodes.keys()) {
      distances.set(nodeId, Number.POSITIVE_INFINITY)
      previous.set(nodeId, null)
      unvisited.add(nodeId)
    }
    distances.set(sourceNodeId, 0)

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentNode: string | null = null
      let minDistance = Number.POSITIVE_INFINITY

      for (const nodeId of unvisited) {
        const distance = distances.get(nodeId)!
        if (distance < minDistance) {
          minDistance = distance
          currentNode = nodeId
        }
      }

      if (!currentNode || minDistance === Number.POSITIVE_INFINITY) {
        break // No more reachable nodes
      }

      unvisited.delete(currentNode)
      nodesEvaluated++

      // If we reached the destination, we can stop
      if (currentNode === destinationNodeId) {
        break
      }

      // Check neighbors
      const edges = graph.edges.get(currentNode) || []
      for (const edge of edges) {
        if (!unvisited.has(edge.toNodeId)) continue

        // Apply filters based on options
        if (this.shouldSkipEdge(edge, options)) continue

        const weight = this.calculateDynamicWeight(edge, options)
        const altDistance = distances.get(currentNode)! + weight

        if (altDistance < distances.get(edge.toNodeId)!) {
          distances.set(edge.toNodeId, altDistance)
          previous.set(edge.toNodeId, currentNode)
        }
      }
    }

    // Reconstruct path
    const path: string[] = []
    let currentNode: string | null = destinationNodeId

    while (currentNode !== null) {
      path.unshift(currentNode)
      currentNode = previous.get(currentNode)!
    }

    // If path doesn't start with source, no route was found
    if (path.length === 0 || path[0] !== sourceNodeId) {
      return {
        distances,
        previous,
        path: [],
        totalDistance: 0,
        totalTime: 0,
        nodesEvaluated,
      }
    }

    // Calculate total distance and time
    let totalDistance = 0
    let totalTime = 0

    for (let i = 0; i < path.length - 1; i++) {
      const fromNodeId = path[i]
      const toNodeId = path[i + 1]
      const edges = graph.edges.get(fromNodeId) || []
      const edge = edges.find((e) => e.toNodeId === toNodeId)

      if (edge) {
        totalDistance += edge.distance
        totalTime += edge.estimatedTime
      }
    }

    return {
      distances,
      previous,
      path,
      totalDistance,
      totalTime,
      nodesEvaluated,
    }
  }

  /**
   * Calculate alternative routes
   */
  private async calculateAlternativeRoutes(
    sourceNodeId: string,
    destinationNodeId: string,
    options: RouteCalculationOptions,
  ): Promise<RouteAlternative[]> {
    const alternatives: RouteAlternative[] = []

    // Alternative 1: Avoid highways
    if (!options.avoidHighways) {
      const altOptions = { ...options, avoidHighways: true }
      try {
        const altResult = await this.dijkstra(sourceNodeId, destinationNodeId, altOptions)
        if (altResult.path.length > 0) {
          alternatives.push({
            id: `alt-no-highways-${Date.now()}`,
            path: altResult.path,
            distance: altResult.totalDistance,
            duration: altResult.totalTime,
            description: "Route avoiding highways",
            avoidanceFactors: ["highways"],
          })
        }
      } catch (error) {
        this.logger.warn("Failed to calculate highway-avoiding alternative", error)
      }
    }

    // Alternative 2: Avoid tolls
    if (!options.avoidTolls) {
      const altOptions = { ...options, avoidTolls: true }
      try {
        const altResult = await this.dijkstra(sourceNodeId, destinationNodeId, altOptions)
        if (altResult.path.length > 0) {
          alternatives.push({
            id: `alt-no-tolls-${Date.now()}`,
            path: altResult.path,
            distance: altResult.totalDistance,
            duration: altResult.totalTime,
            description: "Route avoiding toll roads",
            avoidanceFactors: ["tolls"],
          })
        }
      } catch (error) {
        this.logger.warn("Failed to calculate toll-avoiding alternative", error)
      }
    }

    // Alternative 3: Fastest route (if not already optimizing for time)
    if (options.optimizationCriteria !== OptimizationCriteria.TIME) {
      const altOptions = { ...options, optimizationCriteria: OptimizationCriteria.TIME }
      try {
        const altResult = await this.dijkstra(sourceNodeId, destinationNodeId, altOptions)
        if (altResult.path.length > 0) {
          alternatives.push({
            id: `alt-fastest-${Date.now()}`,
            path: altResult.path,
            distance: altResult.totalDistance,
            duration: altResult.totalTime,
            description: "Fastest route",
            avoidanceFactors: [],
          })
        }
      } catch (error) {
        this.logger.warn("Failed to calculate fastest alternative", error)
      }
    }

    return alternatives.slice(0, 3) // Limit to 3 alternatives
  }

  /**
   * Check if edge should be skipped based on options
   */
  private shouldSkipEdge(edge: GraphEdge, options: RouteCalculationOptions): boolean {
    if (options.avoidTolls && edge.properties?.tollCost > 0) {
      return true
    }

    if (options.avoidHighways && edge.properties?.roadType === "highway") {
      return true
    }

    return false
  }

  /**
   * Calculate dynamic weight for edge based on optimization criteria
   */
  private calculateDynamicWeight(edge: GraphEdge, options: RouteCalculationOptions): number {
    switch (options.optimizationCriteria) {
      case OptimizationCriteria.TIME:
        return edge.estimatedTime
      case OptimizationCriteria.FUEL_EFFICIENCY:
        return edge.distance * 1.2 // Slightly favor shorter routes
      case OptimizationCriteria.COST:
        return edge.distance + (edge.properties?.tollCost || 0) * 10 // Weight toll costs heavily
      case OptimizationCriteria.TRAFFIC_AVOIDANCE:
        return edge.weight * 1.5 // Use pre-calculated traffic weights
      default:
        return edge.distance
    }
  }

  /**
   * Build route waypoints from path
   */
  private async buildRouteWaypoints(
    path: string[],
    additionalWaypoints: Coordinate[] = [],
  ): Promise<
    Array<{
      nodeId: string
      latitude: number
      longitude: number
      order: number
      estimatedArrival?: string
    }>
  > {
    const graph = this.mapDataService.getRouteGraph()
    const waypoints = []

    for (let i = 0; i < path.length; i++) {
      const nodeId = path[i]
      const node = graph.nodes.get(nodeId)

      if (node) {
        waypoints.push({
          nodeId,
          latitude: node.coordinate.latitude,
          longitude: node.coordinate.longitude,
          order: i,
        })
      }
    }

    return waypoints
  }

  /**
   * Generate turn-by-turn route instructions
   */
  private async generateRouteInstructions(path: string[]): Promise<
    Array<{
      step: number
      instruction: string
      distance: number
      duration: number
      coordinates: { latitude: number; longitude: number }
    }>
  > {
    const graph = this.mapDataService.getRouteGraph()
    const instructions = []

    for (let i = 0; i < path.length - 1; i++) {
      const fromNodeId = path[i]
      const toNodeId = path[i + 1]
      const fromNode = graph.nodes.get(fromNodeId)
      const toNode = graph.nodes.get(toNodeId)
      const edges = graph.edges.get(fromNodeId) || []
      const edge = edges.find((e) => e.toNodeId === toNodeId)

      if (fromNode && toNode && edge) {
        const bearing = this.calculateBearing(fromNode.coordinate, toNode.coordinate)
        const direction = this.bearingToDirection(bearing)

        instructions.push({
          step: i + 1,
          instruction:
            i === 0
              ? `Head ${direction} for ${edge.distance.toFixed(1)} km`
              : `Continue ${direction} for ${edge.distance.toFixed(1)} km`,
          distance: edge.distance,
          duration: edge.estimatedTime,
          coordinates: {
            latitude: fromNode.coordinate.latitude,
            longitude: fromNode.coordinate.longitude,
          },
        })
      }
    }

    // Add final instruction
    if (path.length > 0) {
      const finalNode = graph.nodes.get(path[path.length - 1])
      if (finalNode) {
        instructions.push({
          step: instructions.length + 1,
          instruction: "You have arrived at your destination",
          distance: 0,
          duration: 0,
          coordinates: {
            latitude: finalNode.coordinate.latitude,
            longitude: finalNode.coordinate.longitude,
          },
        })
      }
    }

    return instructions
  }

  /**
   * Calculate bearing between two coordinates
   */
  private calculateBearing(from: Coordinate, to: Coordinate): number {
    const lat1 = (from.latitude * Math.PI) / 180
    const lat2 = (to.latitude * Math.PI) / 180
    const deltaLng = ((to.longitude - from.longitude) * Math.PI) / 180

    const y = Math.sin(deltaLng) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng)

    const bearing = Math.atan2(y, x)
    return ((bearing * 180) / Math.PI + 360) % 360
  }

  /**
   * Convert bearing to direction
   */
  private bearingToDirection(bearing: number): string {
    const directions = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"]
    const index = Math.round(bearing / 45) % 8
    return directions[index]
  }

  /**
   * Calculate route cost (fuel + tolls)
   */
  private calculateRouteCost(path: string[], options: RouteCalculationOptions): number {
    const graph = this.mapDataService.getRouteGraph()
    let totalCost = 0

    for (let i = 0; i < path.length - 1; i++) {
      const fromNodeId = path[i]
      const edges = graph.edges.get(fromNodeId) || []
      const edge = edges.find((e) => e.toNodeId === path[i + 1])

      if (edge) {
        // Fuel cost (assuming $0.15 per km)
        totalCost += edge.distance * 0.15

        // Toll cost
        totalCost += edge.properties?.tollCost || 0
      }
    }

    return Math.round(totalCost * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Get cached route
   */
  private async getCachedRoute(
    source: Coordinate,
    destination: Coordinate,
    options: RouteCalculationOptions,
  ): Promise<Route | null> {
    const cacheKey = this.generateCacheKey(source, destination, options)

    // Check memory cache first
    const memoryRoute = this.routeCache.get(cacheKey)
    if (memoryRoute && memoryRoute.expiresAt && memoryRoute.expiresAt > new Date()) {
      return memoryRoute
    }

    // Check database cache
    const dbRoute = await this.routeRepository.findOne({
      where: {
        sourceLatitude: source.latitude,
        sourceLongitude: source.longitude,
        destinationLatitude: destination.latitude,
        destinationLongitude: destination.longitude,
        optimizationCriteria: options.optimizationCriteria as OptimizationCriteria,
        status: RouteStatus.CALCULATED,
      },
      order: { calculatedAt: "DESC" },
    })

    if (dbRoute && dbRoute.expiresAt && dbRoute.expiresAt > new Date()) {
      this.cacheRoute(dbRoute)
      return dbRoute
    }

    return null
  }

  /**
   * Cache route in memory
   */
  private cacheRoute(route: Route): void {
    const cacheKey = this.generateCacheKey(
      { latitude: route.sourceLatitude, longitude: route.sourceLongitude },
      { latitude: route.destinationLatitude, longitude: route.destinationLongitude },
      { optimizationCriteria: route.optimizationCriteria },
    )

    // Implement LRU cache eviction
    if (this.routeCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.routeCache.keys().next().value
      this.routeCache.delete(firstKey)
    }

    this.routeCache.set(cacheKey, route)
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(
    source: Coordinate,
    destination: Coordinate,
    options: Partial<RouteCalculationOptions>,
  ): string {
    return `${source.latitude.toFixed(6)},${source.longitude.toFixed(6)}-${destination.latitude.toFixed(6)},${destination.longitude.toFixed(6)}-${options.optimizationCriteria || "distance"}`
  }

  /**
   * Create calculation record
   */
  private async createCalculationRecord(
    source: Coordinate,
    destination: Coordinate,
    options: RouteCalculationOptions,
  ): Promise<string> {
    const calculation = this.routeCalculationRepository.create({
      sourceLatitude: source.latitude,
      sourceLongitude: source.longitude,
      destinationLatitude: destination.latitude,
      destinationLongitude: destination.longitude,
      status: CalculationStatus.PENDING,
      requestParameters: {
        optimizationCriteria: options.optimizationCriteria,
        avoidTolls: options.avoidTolls,
        avoidHighways: options.avoidHighways,
        vehicleType: options.vehicleType,
        maxDistance: options.maxDistance,
        includeAlternatives: options.includeAlternatives,
      },
    })

    const saved = await this.routeCalculationRepository.save(calculation)
    return saved.id
  }

  /**
   * Update calculation record
   */
  private async updateCalculationRecord(
    calculationId: string,
    status: CalculationStatus,
    calculationTime?: number,
    nodesEvaluated?: number,
    routeId?: string,
    errorMessage?: string,
  ): Promise<void> {
    await this.routeCalculationRepository.update(calculationId, {
      status,
      calculationTime,
      nodesEvaluated: nodesEvaluated || 0,
      routeId,
      errorMessage,
    })
  }

  /**
   * Get route by ID
   */
  async getRouteById(routeId: string): Promise<Route | null> {
    return await this.routeRepository.findOne({ where: { id: routeId } })
  }

  /**
   * Get routes with filtering and pagination
   */
  async getRoutes(filters: {
    sourceLatitude?: number
    sourceLongitude?: number
    destinationLatitude?: number
    destinationLongitude?: number
    optimizationCriteria?: OptimizationCriteria
    status?: RouteStatus
    fromDate?: Date
    toDate?: Date
    maxDistance?: number
    minDistance?: number
    limit?: number
    offset?: number
    sortOrder?: "ASC" | "DESC"
  }): Promise<{ routes: Route[]; total: number }> {
    const queryBuilder = this.routeRepository.createQueryBuilder("route")

    // Apply filters
    if (filters.sourceLatitude !== undefined) {
      queryBuilder.andWhere("ABS(route.sourceLatitude - :sourceLat) < 0.01", { sourceLat: filters.sourceLatitude })
    }
    if (filters.sourceLongitude !== undefined) {
      queryBuilder.andWhere("ABS(route.sourceLongitude - :sourceLng) < 0.01", { sourceLng: filters.sourceLongitude })
    }
    if (filters.destinationLatitude !== undefined) {
      queryBuilder.andWhere("ABS(route.destinationLatitude - :destLat) < 0.01", {
        destLat: filters.destinationLatitude,
      })
    }
    if (filters.destinationLongitude !== undefined) {
      queryBuilder.andWhere("ABS(route.destinationLongitude - :destLng) < 0.01", {
        destLng: filters.destinationLongitude,
      })
    }
    if (filters.optimizationCriteria) {
      queryBuilder.andWhere("route.optimizationCriteria = :criteria", { criteria: filters.optimizationCriteria })
    }
    if (filters.status) {
      queryBuilder.andWhere("route.status = :status", { status: filters.status })
    }
    if (filters.fromDate) {
      queryBuilder.andWhere("route.calculatedAt >= :fromDate", { fromDate: filters.fromDate })
    }
    if (filters.toDate) {
      queryBuilder.andWhere("route.calculatedAt <= :toDate", { toDate: filters.toDate })
    }
    if (filters.maxDistance !== undefined) {
      queryBuilder.andWhere("route.totalDistance <= :maxDistance", { maxDistance: filters.maxDistance })
    }
    if (filters.minDistance !== undefined) {
      queryBuilder.andWhere("route.totalDistance >= :minDistance", { minDistance: filters.minDistance })
    }

    // Get total count
    const total = await queryBuilder.getCount()

    // Apply pagination and sorting
    queryBuilder
      .orderBy("route.calculatedAt", filters.sortOrder || "DESC")
      .limit(filters.limit || 50)
      .offset(filters.offset || 0)

    const routes = await queryBuilder.getMany()

    return { routes, total }
  }

  /**
   * Delete expired routes
   */
  async cleanupExpiredRoutes(): Promise<number> {
    const result = await this.routeRepository.delete({
      expiresAt: { $lt: new Date() } as any,
    })
    return result.affected || 0
  }

  /**
   * Get calculation statistics
   */
  async getCalculationStatistics(): Promise<{
    totalCalculations: number
    successfulCalculations: number
    failedCalculations: number
    averageCalculationTime: number
    cacheHitRate: number
  }> {
    const calculations = await this.routeCalculationRepository.find()

    const totalCalculations = calculations.length
    const successfulCalculations = calculations.filter((c) => c.status === CalculationStatus.COMPLETED).length
    const failedCalculations = calculations.filter((c) => c.status === CalculationStatus.FAILED).length
    const cachedCalculations = calculations.filter((c) => c.status === CalculationStatus.CACHED).length

    const completedCalculations = calculations.filter((c) => c.calculationTime && c.calculationTime > 0)
    const averageCalculationTime =
      completedCalculations.length > 0
        ? completedCalculations.reduce((sum, c) => sum + (c.calculationTime || 0), 0) / completedCalculations.length
        : 0

    const cacheHitRate = totalCalculations > 0 ? (cachedCalculations / totalCalculations) * 100 : 0

    return {
      totalCalculations,
      successfulCalculations,
      failedCalculations,
      averageCalculationTime: Math.round(averageCalculationTime),
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    }
  }
}
