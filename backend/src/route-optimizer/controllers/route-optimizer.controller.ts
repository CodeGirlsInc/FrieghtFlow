import {
  Controller,
  Post,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger"
import type { RouteOptimizerService } from "../services/route-optimizer.service"
import type { RouteStorageService } from "../services/route-storage.service"
import type { MapDataService } from "../services/map-data.service"
import type { CalculateRouteDto } from "../dto/calculate-route.dto"
import { RouteResponseDto } from "../dto/route-response.dto"
import type { QueryRoutesDto } from "../dto/query-routes.dto"

@ApiTags("Route Optimizer")
@Controller("route-optimizer")
@UseInterceptors(ClassSerializerInterceptor)
export class RouteOptimizerController {
  private readonly logger = new Logger(RouteOptimizerController.name)

  constructor(
    private readonly routeOptimizerService: RouteOptimizerService,
    private readonly routeStorageService: RouteStorageService,
    private readonly mapDataService: MapDataService,
  ) {}

  @Post("calculate-route")
  @ApiOperation({ summary: "Calculate optimal route between two points" })
  @ApiResponse({
    status: 201,
    description: "Route calculated successfully",
    type: RouteResponseDto,
  })
  @ApiResponse({ status: 400, description: "Invalid input parameters" })
  @ApiResponse({ status: 500, description: "Route calculation failed" })
  async calculateRoute(calculateRouteDto: CalculateRouteDto): Promise<RouteResponseDto> {
    try {
      this.logger.log(
        `Calculating route from (${calculateRouteDto.source.latitude}, ${calculateRouteDto.source.longitude}) to (${calculateRouteDto.destination.latitude}, ${calculateRouteDto.destination.longitude})`,
      )

      const route = await this.routeOptimizerService.calculateRoute(
        calculateRouteDto.source,
        calculateRouteDto.destination,
        calculateRouteDto.waypoints || [],
        {
          optimizationCriteria: calculateRouteDto.optimizationCriteria || "distance",
          avoidTolls: calculateRouteDto.avoidTolls,
          avoidHighways: calculateRouteDto.avoidHighways,
          vehicleType: calculateRouteDto.vehicleType,
          maxDistance: calculateRouteDto.maxDistance,
          includeAlternatives: calculateRouteDto.includeAlternatives,
          useCache: calculateRouteDto.useCache,
        },
      )

      return {
        id: route.id,
        source: {
          latitude: route.sourceLatitude,
          longitude: route.sourceLongitude,
        },
        destination: {
          latitude: route.destinationLatitude,
          longitude: route.destinationLongitude,
        },
        waypoints: route.waypoints,
        totalDistance: route.totalDistance,
        estimatedDuration: route.estimatedDuration,
        estimatedCost: route.estimatedCost,
        optimizationCriteria: route.optimizationCriteria,
        status: route.status,
        alternativeRoutes: route.alternativeRoutes,
        routeMetrics: route.routeMetrics,
        routeInstructions: route.routeInstructions,
        calculatedAt: route.calculatedAt,
        expiresAt: route.expiresAt,
      }
    } catch (error) {
      this.logger.error("Route calculation failed", error.stack)
      throw new HttpException(
        {
          message: "Route calculation failed",
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get("routes")
  @ApiOperation({ summary: "Get routes with filtering and pagination" })
  @ApiResponse({
    status: 200,
    description: "Routes retrieved successfully",
    schema: {
      type: "object",
      properties: {
        routes: { type: "array", items: { $ref: "#/components/schemas/RouteResponseDto" } },
        total: { type: "number" },
        limit: { type: "number" },
        offset: { type: "number" },
      },
    },
  })
  async getRoutes(queryDto: QueryRoutesDto) {
    try {
      const { routes, total } = await this.routeOptimizerService.getRoutes({
        sourceLatitude: queryDto.sourceLatitude,
        sourceLongitude: queryDto.sourceLongitude,
        destinationLatitude: queryDto.destinationLatitude,
        destinationLongitude: queryDto.destinationLongitude,
        optimizationCriteria: queryDto.optimizationCriteria,
        status: queryDto.status,
        fromDate: queryDto.fromDate ? new Date(queryDto.fromDate) : undefined,
        toDate: queryDto.toDate ? new Date(queryDto.toDate) : undefined,
        maxDistance: queryDto.maxDistance,
        minDistance: queryDto.minDistance,
        limit: queryDto.limit,
        offset: queryDto.offset,
        sortOrder: queryDto.sortOrder,
      })

      return {
        routes: routes.map((route) => ({
          id: route.id,
          source: {
            latitude: route.sourceLatitude,
            longitude: route.sourceLongitude,
          },
          destination: {
            latitude: route.destinationLatitude,
            longitude: route.destinationLongitude,
          },
          waypoints: route.waypoints,
          totalDistance: route.totalDistance,
          estimatedDuration: route.estimatedDuration,
          estimatedCost: route.estimatedCost,
          optimizationCriteria: route.optimizationCriteria,
          status: route.status,
          alternativeRoutes: route.alternativeRoutes,
          routeMetrics: route.routeMetrics,
          calculatedAt: route.calculatedAt,
          expiresAt: route.expiresAt,
        })),
        total,
        limit: queryDto.limit || 50,
        offset: queryDto.offset || 0,
      }
    } catch (error) {
      this.logger.error("Failed to retrieve routes", error.stack)
      throw new HttpException("Failed to retrieve routes", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get("routes/:id")
  @ApiOperation({ summary: "Get route by ID" })
  @ApiResponse({
    status: 200,
    description: "Route retrieved successfully",
    type: RouteResponseDto,
  })
  @ApiResponse({ status: 404, description: "Route not found" })
  async getRouteById(routeId: string): Promise<RouteResponseDto> {
    try {
      const route = await this.routeOptimizerService.getRouteById(routeId)

      if (!route) {
        throw new HttpException("Route not found", HttpStatus.NOT_FOUND)
      }

      return {
        id: route.id,
        source: {
          latitude: route.sourceLatitude,
          longitude: route.sourceLongitude,
        },
        destination: {
          latitude: route.destinationLatitude,
          longitude: route.destinationLongitude,
        },
        waypoints: route.waypoints,
        totalDistance: route.totalDistance,
        estimatedDuration: route.estimatedDuration,
        estimatedCost: route.estimatedCost,
        optimizationCriteria: route.optimizationCriteria,
        status: route.status,
        alternativeRoutes: route.alternativeRoutes,
        routeMetrics: route.routeMetrics,
        routeInstructions: route.routeInstructions,
        calculatedAt: route.calculatedAt,
        expiresAt: route.expiresAt,
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      this.logger.error("Failed to retrieve route", error.stack)
      throw new HttpException("Failed to retrieve route", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get("statistics/routes")
  @ApiOperation({ summary: "Get route statistics" })
  @ApiResponse({
    status: 200,
    description: "Route statistics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        totalRoutes: { type: "number" },
        routesByStatus: { type: "object" },
        routesByOptimization: { type: "object" },
        averageDistance: { type: "number" },
        averageDuration: { type: "number" },
      },
    },
  })
  async getRouteStatistics() {
    try {
      return await this.routeStorageService.getRouteStatistics()
    } catch (error) {
      this.logger.error("Failed to retrieve route statistics", error.stack)
      throw new HttpException("Failed to retrieve route statistics", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get("statistics/calculations")
  @ApiOperation({ summary: "Get calculation statistics" })
  @ApiResponse({
    status: 200,
    description: "Calculation statistics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        totalCalculations: { type: "number" },
        successfulCalculations: { type: "number" },
        failedCalculations: { type: "number" },
        averageCalculationTime: { type: "number" },
        cacheHitRate: { type: "number" },
      },
    },
  })
  async getCalculationStatistics() {
    try {
      return await this.routeOptimizerService.getCalculationStatistics()
    } catch (error) {
      this.logger.error("Failed to retrieve calculation statistics", error.stack)
      throw new HttpException("Failed to retrieve calculation statistics", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get("statistics/performance")
  @ApiOperation({ summary: "Get performance metrics" })
  @ApiResponse({
    status: 200,
    description: "Performance metrics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        averageCalculationTime: { type: "number" },
        p95CalculationTime: { type: "number" },
        successRate: { type: "number" },
        errorRate: { type: "number" },
        cacheHitRate: { type: "number" },
      },
    },
  })
  async getPerformanceMetrics() {
    try {
      return await this.routeStorageService.getPerformanceMetrics()
    } catch (error) {
      this.logger.error("Failed to retrieve performance metrics", error.stack)
      throw new HttpException("Failed to retrieve performance metrics", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get("map/statistics")
  @ApiOperation({ summary: "Get map data statistics" })
  @ApiResponse({
    status: 200,
    description: "Map statistics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        nodeCount: { type: "number" },
        edgeCount: { type: "number" },
        avgDegree: { type: "number" },
        nodeTypes: { type: "object" },
      },
    },
  })
  async getMapStatistics() {
    try {
      return this.mapDataService.getGraphStatistics()
    } catch (error) {
      this.logger.error("Failed to retrieve map statistics", error.stack)
      throw new HttpException("Failed to retrieve map statistics", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Post("map/refresh")
  @ApiOperation({ summary: "Refresh map data from database" })
  @ApiResponse({ status: 200, description: "Map data refreshed successfully" })
  async refreshMapData() {
    try {
      await this.mapDataService.refreshGraphData()
      return { message: "Map data refreshed successfully" }
    } catch (error) {
      this.logger.error("Failed to refresh map data", error.stack)
      throw new HttpException("Failed to refresh map data", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Post("cleanup/:days")
  @ApiOperation({ summary: "Cleanup old routes" })
  @ApiResponse({ status: 200, description: "Routes cleaned up successfully" })
  async cleanupOldRoutes(days: string) {
    try {
      const daysNumber = Number.parseInt(days, 10)
      if (Number.isNaN(daysNumber) || daysNumber < 1) {
        throw new HttpException("Invalid days parameter", HttpStatus.BAD_REQUEST)
      }

      const deletedCount = await this.routeStorageService.cleanupOldRoutes(daysNumber)
      return {
        message: `Successfully cleaned up ${deletedCount} routes older than ${daysNumber} days`,
        deletedCount,
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      this.logger.error("Failed to cleanup old routes", error.stack)
      throw new HttpException("Failed to cleanup old routes", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get("nearest-node")
  @ApiOperation({ summary: "Find nearest node to coordinates" })
  @ApiQuery({ name: "latitude", type: "number", description: "Latitude coordinate" })
  @ApiQuery({ name: "longitude", type: "number", description: "Longitude coordinate" })
  @ApiResponse({
    status: 200,
    description: "Nearest node found",
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        coordinate: {
          type: "object",
          properties: {
            latitude: { type: "number" },
            longitude: { type: "number" },
          },
        },
        nodeType: { type: "string" },
        distance: { type: "number" },
      },
    },
  })
  async findNearestNode(latitude: string, longitude: string) {
    try {
      const lat = Number.parseFloat(latitude)
      const lng = Number.parseFloat(longitude)

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        throw new HttpException("Invalid coordinates", HttpStatus.BAD_REQUEST)
      }

      const nearestNode = this.mapDataService.findNearestNode({ latitude: lat, longitude: lng })

      if (!nearestNode) {
        throw new HttpException("No nodes found", HttpStatus.NOT_FOUND)
      }

      const distance = this.mapDataService.calculateDistance({ latitude: lat, longitude: lng }, nearestNode.coordinate)

      return {
        id: nearestNode.id,
        coordinate: nearestNode.coordinate,
        nodeType: nearestNode.nodeType,
        properties: nearestNode.properties,
        distance: Math.round(distance * 1000) / 1000, // Round to 3 decimal places
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      this.logger.error("Failed to find nearest node", error.stack)
      throw new HttpException("Failed to find nearest node", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get("nodes-in-radius")
  @ApiOperation({ summary: "Get nodes within radius of coordinates" })
  @ApiQuery({ name: "latitude", type: "number", description: "Latitude coordinate" })
  @ApiQuery({ name: "longitude", type: "number", description: "Longitude coordinate" })
  @ApiQuery({ name: "radius", type: "number", description: "Radius in kilometers" })
  @ApiResponse({
    status: 200,
    description: "Nodes within radius found",
    schema: {
      type: "object",
      properties: {
        nodes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              coordinate: {
                type: "object",
                properties: {
                  latitude: { type: "number" },
                  longitude: { type: "number" },
                },
              },
              nodeType: { type: "string" },
              distance: { type: "number" },
            },
          },
        },
        count: { type: "number" },
      },
    },
  })
  async getNodesInRadius(latitude: string, longitude: string, radius: string) {
    try {
      const lat = Number.parseFloat(latitude)
      const lng = Number.parseFloat(longitude)
      const radiusKm = Number.parseFloat(radius)

      if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radiusKm)) {
        throw new HttpException("Invalid parameters", HttpStatus.BAD_REQUEST)
      }

      if (radiusKm <= 0 || radiusKm > 1000) {
        throw new HttpException("Radius must be between 0 and 1000 km", HttpStatus.BAD_REQUEST)
      }

      const nodes = this.mapDataService.getNodesWithinRadius({ latitude: lat, longitude: lng }, radiusKm)

      const nodesWithDistance = nodes.map((node) => ({
        id: node.id,
        coordinate: node.coordinate,
        nodeType: node.nodeType,
        properties: node.properties,
        distance:
          Math.round(this.mapDataService.calculateDistance({ latitude: lat, longitude: lng }, node.coordinate) * 1000) /
          1000,
      }))

      return {
        nodes: nodesWithDistance,
        count: nodesWithDistance.length,
        searchRadius: radiusKm,
        searchCenter: { latitude: lat, longitude: lng },
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      this.logger.error("Failed to get nodes in radius", error.stack)
      throw new HttpException("Failed to get nodes in radius", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
