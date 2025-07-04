import { Test, type TestingModule } from "@nestjs/testing"
import { HttpException, HttpStatus } from "@nestjs/common"
import { RouteOptimizerController } from "../controllers/route-optimizer.controller"
import { RouteOptimizerService } from "../services/route-optimizer.service"
import { RouteStorageService } from "../services/route-storage.service"
import { MapDataService } from "../services/map-data.service"
import { OptimizationCriteria, RouteStatus } from "../entities/route.entity"
import { jest } from "@jest/globals"

describe("RouteOptimizerController", () => {
  let controller: RouteOptimizerController
  let routeOptimizerService: RouteOptimizerService
  let routeStorageService: RouteStorageService
  let mapDataService: MapDataService

  const mockRouteOptimizerService = {
    calculateRoute: jest.fn(),
    getRoutes: jest.fn(),
    getRouteById: jest.fn(),
    getCalculationStatistics: jest.fn(),
  }

  const mockRouteStorageService = {
    getRouteStatistics: jest.fn(),
    getPerformanceMetrics: jest.fn(),
    cleanupOldRoutes: jest.fn(),
  }

  const mockMapDataService = {
    getGraphStatistics: jest.fn(),
    refreshGraphData: jest.fn(),
    findNearestNode: jest.fn(),
    getNodesWithinRadius: jest.fn(),
    calculateDistance: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteOptimizerController],
      providers: [
        {
          provide: RouteOptimizerService,
          useValue: mockRouteOptimizerService,
        },
        {
          provide: RouteStorageService,
          useValue: mockRouteStorageService,
        },
        {
          provide: MapDataService,
          useValue: mockMapDataService,
        },
      ],
    }).compile()

    controller = module.get<RouteOptimizerController>(RouteOptimizerController)
    routeOptimizerService = module.get<RouteOptimizerService>(RouteOptimizerService)
    routeStorageService = module.get<RouteStorageService>(RouteStorageService)
    mapDataService = module.get<MapDataService>(MapDataService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("calculateRoute", () => {
    it("should calculate route successfully", async () => {
      const calculateRouteDto = {
        source: { latitude: 40.7128, longitude: -74.006 },
        destination: { latitude: 34.0522, longitude: -118.2437 },
        optimizationCriteria: OptimizationCriteria.DISTANCE,
      }

      const mockRoute = {
        id: "route1",
        sourceLatitude: 40.7128,
        sourceLongitude: -74.006,
        destinationLatitude: 34.0522,
        destinationLongitude: -118.2437,
        totalDistance: 100,
        estimatedDuration: 120,
        optimizationCriteria: OptimizationCriteria.DISTANCE,
        status: RouteStatus.CALCULATED,
        waypoints: [],
        routeMetrics: {
          algorithmsUsed: ["dijkstra"],
          calculationTime: 50,
          nodesEvaluated: 2,
          cacheHit: false,
        },
        calculatedAt: new Date(),
      }

      mockRouteOptimizerService.calculateRoute.mockResolvedValue(mockRoute)

      const result = await controller.calculateRoute(calculateRouteDto)

      expect(result.id).toBe("route1")
      expect(result.totalDistance).toBe(100)
      expect(mockRouteOptimizerService.calculateRoute).toHaveBeenCalledWith(
        calculateRouteDto.source,
        calculateRouteDto.destination,
        [],
        expect.objectContaining({
          optimizationCriteria: OptimizationCriteria.DISTANCE,
        }),
      )
    })

    it("should handle calculation errors", async () => {
      const calculateRouteDto = {
        source: { latitude: 40.7128, longitude: -74.006 },
        destination: { latitude: 34.0522, longitude: -118.2437 },
      }

      mockRouteOptimizerService.calculateRoute.mockRejectedValue(new Error("Calculation failed"))

      await expect(controller.calculateRoute(calculateRouteDto)).rejects.toThrow(HttpException)
    })
  })

  describe("getRoutes", () => {
    it("should return routes with pagination", async () => {
      const queryDto = { limit: 10, offset: 0 }
      const mockResult = {
        routes: [
          {
            id: "route1",
            sourceLatitude: 40.7128,
            sourceLongitude: -74.006,
            totalDistance: 100,
          },
        ],
        total: 1,
      }

      mockRouteOptimizerService.getRoutes.mockResolvedValue(mockResult)

      const result = await controller.getRoutes(queryDto)

      expect(result.routes).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.offset).toBe(0)
    })
  })

  describe("getRouteById", () => {
    it("should return route by ID", async () => {
      const routeId = "route1"
      const mockRoute = {
        id: routeId,
        sourceLatitude: 40.7128,
        sourceLongitude: -74.006,
        totalDistance: 100,
        optimizationCriteria: OptimizationCriteria.DISTANCE,
        status: RouteStatus.CALCULATED,
        waypoints: [],
        calculatedAt: new Date(),
      }

      mockRouteOptimizerService.getRouteById.mockResolvedValue(mockRoute)

      const result = await controller.getRouteById(routeId)

      expect(result.id).toBe(routeId)
      expect(result.totalDistance).toBe(100)
    })

    it("should throw 404 when route not found", async () => {
      const routeId = "nonexistent"

      mockRouteOptimizerService.getRouteById.mockResolvedValue(null)

      await expect(controller.getRouteById(routeId)).rejects.toThrow(
        new HttpException("Route not found", HttpStatus.NOT_FOUND),
      )
    })
  })

  describe("findNearestNode", () => {
    it("should find nearest node", async () => {
      const mockNode = {
        id: "node1",
        coordinate: { latitude: 40.7128, longitude: -74.006 },
        nodeType: "city_center",
        properties: {},
      }

      mockMapDataService.findNearestNode.mockReturnValue(mockNode)
      mockMapDataService.calculateDistance.mockReturnValue(0.5)

      const result = await controller.findNearestNode("40.7128", "-74.006")

      expect(result.id).toBe("node1")
      expect(result.distance).toBe(0.5)
    })

    it("should handle invalid coordinates", async () => {
      await expect(controller.findNearestNode("invalid", "-74.006")).rejects.toThrow(
        new HttpException("Invalid coordinates", HttpStatus.BAD_REQUEST),
      )
    })
  })

  describe("getNodesInRadius", () => {
    it("should return nodes within radius", async () => {
      const mockNodes = [
        {
          id: "node1",
          coordinate: { latitude: 40.7128, longitude: -74.006 },
          nodeType: "city_center",
          properties: {},
        },
      ]

      mockMapDataService.getNodesWithinRadius.mockReturnValue(mockNodes)
      mockMapDataService.calculateDistance.mockReturnValue(0.5)

      const result = await controller.getNodesInRadius("40.7128", "-74.006", "10")

      expect(result.nodes).toHaveLength(1)
      expect(result.count).toBe(1)
      expect(result.searchRadius).toBe(10)
    })

    it("should handle invalid radius", async () => {
      await expect(controller.getNodesInRadius("40.7128", "-74.006", "0")).rejects.toThrow(
        new HttpException("Radius must be between 0 and 1000 km", HttpStatus.BAD_REQUEST),
      )
    })
  })
})
