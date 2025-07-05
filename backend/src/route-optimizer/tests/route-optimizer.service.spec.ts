import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { RouteOptimizerService } from "../services/route-optimizer.service"
import { MapDataService } from "../services/map-data.service"
import { Route, OptimizationCriteria } from "../entities/route.entity"
import { RouteCalculation } from "../entities/route-calculation.entity"
import { jest } from "@jest/globals"

describe("RouteOptimizerService", () => {
  let service: RouteOptimizerService
  let mapDataService: MapDataService
  let routeRepository: Repository<Route>
  let routeCalculationRepository: Repository<RouteCalculation>

  const mockRouteRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    delete: jest.fn(),
  }

  const mockRouteCalculationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
  }

  const mockMapDataService = {
    getRouteGraph: jest.fn(),
    findNearestNode: jest.fn(),
    calculateDistance: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteOptimizerService,
        {
          provide: getRepositoryToken(Route),
          useValue: mockRouteRepository,
        },
        {
          provide: getRepositoryToken(RouteCalculation),
          useValue: mockRouteCalculationRepository,
        },
        {
          provide: MapDataService,
          useValue: mockMapDataService,
        },
      ],
    }).compile()

    service = module.get<RouteOptimizerService>(RouteOptimizerService)
    mapDataService = module.get<MapDataService>(MapDataService)
    routeRepository = module.get<Repository<Route>>(getRepositoryToken(Route))
    routeCalculationRepository = module.get<Repository<RouteCalculation>>(getRepositoryToken(RouteCalculation))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("calculateRoute", () => {
    it("should calculate a route successfully", async () => {
      const source = { latitude: 40.7128, longitude: -74.006 }
      const destination = { latitude: 34.0522, longitude: -118.2437 }

      const mockSourceNode = {
        id: "node1",
        coordinate: source,
        nodeType: "city_center",
      }

      const mockDestinationNode = {
        id: "node2",
        coordinate: destination,
        nodeType: "city_center",
      }

      const mockGraph = {
        nodes: new Map([
          ["node1", mockSourceNode],
          ["node2", mockDestinationNode],
        ]),
        edges: new Map([
          [
            "node1",
            [{ id: "edge1", fromNodeId: "node1", toNodeId: "node2", weight: 100, distance: 100, estimatedTime: 120 }],
          ],
        ]),
        adjacencyList: new Map([["node1", ["node2"]]]),
      }

      const mockRoute = {
        id: "route1",
        sourceLatitude: source.latitude,
        sourceLongitude: source.longitude,
        destinationLatitude: destination.latitude,
        destinationLongitude: destination.longitude,
        totalDistance: 100,
        estimatedDuration: 120,
        optimizationCriteria: OptimizationCriteria.DISTANCE,
        waypoints: [],
        routeMetrics: {
          algorithmsUsed: ["dijkstra"],
          calculationTime: 50,
          nodesEvaluated: 2,
          cacheHit: false,
        },
        calculatedAt: new Date(),
      }

      mockMapDataService.findNearestNode.mockReturnValueOnce(mockSourceNode).mockReturnValueOnce(mockDestinationNode)
      mockMapDataService.getRouteGraph.mockReturnValue(mockGraph)
      mockRouteCalculationRepository.create.mockReturnValue({ id: "calc1" })
      mockRouteCalculationRepository.save.mockResolvedValue({ id: "calc1" })
      mockRouteRepository.create.mockReturnValue(mockRoute)
      mockRouteRepository.save.mockResolvedValue(mockRoute)

      const result = await service.calculateRoute(source, destination)

      expect(result).toBeDefined()
      expect(result.totalDistance).toBe(100)
      expect(result.estimatedDuration).toBe(120)
      expect(mockRouteRepository.save).toHaveBeenCalled()
    })

    it("should throw error when no route found", async () => {
      const source = { latitude: 40.7128, longitude: -74.006 }
      const destination = { latitude: 34.0522, longitude: -118.2437 }

      mockMapDataService.findNearestNode.mockReturnValue(null)
      mockRouteCalculationRepository.create.mockReturnValue({ id: "calc1" })
      mockRouteCalculationRepository.save.mockResolvedValue({ id: "calc1" })

      await expect(service.calculateRoute(source, destination)).rejects.toThrow(
        "Could not find nearest nodes for source or destination",
      )
    })
  })

  describe("getRoutes", () => {
    it("should return routes with pagination", async () => {
      const mockRoutes = [
        {
          id: "route1",
          sourceLatitude: 40.7128,
          sourceLongitude: -74.006,
          totalDistance: 100,
        },
      ]

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRoutes),
      }

      mockRouteRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const result = await service.getRoutes({ limit: 10, offset: 0 })

      expect(result.routes).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })

  describe("getCalculationStatistics", () => {
    it("should return calculation statistics", async () => {
      const mockCalculations = [
        { status: "completed", calculationTime: 100 },
        { status: "failed", calculationTime: null },
        { status: "cached", calculationTime: null },
      ]

      mockRouteCalculationRepository.find.mockResolvedValue(mockCalculations)

      const result = await service.getCalculationStatistics()

      expect(result.totalCalculations).toBe(3)
      expect(result.successfulCalculations).toBe(1)
      expect(result.failedCalculations).toBe(1)
      expect(result.averageCalculationTime).toBe(100)
    })
  })
})
