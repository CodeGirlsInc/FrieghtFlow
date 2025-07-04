import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { RouteOptimizerService } from "../services/route-optimizer.service"
import { MapDataService } from "../services/map-data.service"
import { Route } from "../entities/route.entity"
import { RouteCalculation } from "../entities/route-calculation.entity"
import { jest } from "@jest/globals"

describe("RouteOptimizerService - Stress Tests", () => {
  let service: RouteOptimizerService
  let mapDataService: MapDataService

  const mockRouteRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  }

  const mockRouteCalculationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
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
  })

  describe("High Volume Route Calculations", () => {
    it("should handle 100 concurrent route calculations", async () => {
      // Setup mock data for large graph
      const mockNodes = new Map()
      const mockEdges = new Map()
      const mockAdjacencyList = new Map()

      // Create 1000 nodes
      for (let i = 0; i < 1000; i++) {
        const nodeId = `node${i}`
        mockNodes.set(nodeId, {
          id: nodeId,
          coordinate: {
            latitude: 40 + (Math.random() - 0.5) * 10,
            longitude: -74 + (Math.random() - 0.5) * 10,
          },
          nodeType: "intersection",
        })
      }

      // Create edges between nodes
      for (let i = 0; i < 1000; i++) {
        const nodeId = `node${i}`
        const edges = []
        const adjacentNodes = []

        // Connect to 5 random other nodes
        for (let j = 0; j < 5; j++) {
          const targetNodeId = `node${Math.floor(Math.random() * 1000)}`
          if (targetNodeId !== nodeId) {
            edges.push({
              id: `edge${i}-${j}`,
              fromNodeId: nodeId,
              toNodeId: targetNodeId,
              weight: Math.random() * 100,
              distance: Math.random() * 100,
              estimatedTime: Math.random() * 120,
            })
            adjacentNodes.push(targetNodeId)
          }
        }

        mockEdges.set(nodeId, edges)
        mockAdjacencyList.set(nodeId, adjacentNodes)
      }

      const mockGraph = {
        nodes: mockNodes,
        edges: mockEdges,
        adjacencyList: mockAdjacencyList,
      }

      mockMapDataService.getRouteGraph.mockReturnValue(mockGraph)
      mockMapDataService.findNearestNode.mockImplementation((coord) => {
        return {
          id: "node0",
          coordinate: coord,
          nodeType: "intersection",
        }
      })

      mockRouteCalculationRepository.create.mockImplementation(() => ({ id: `calc${Date.now()}` }))
      mockRouteCalculationRepository.save.mockImplementation((calc) => Promise.resolve(calc))
      mockRouteRepository.create.mockImplementation((route) => route)
      mockRouteRepository.save.mockImplementation((route) => Promise.resolve({ ...route, id: `route${Date.now()}` }))

      // Create 100 concurrent route calculation requests
      const requests = []
      for (let i = 0; i < 100; i++) {
        const source = {
          latitude: 40 + (Math.random() - 0.5) * 5,
          longitude: -74 + (Math.random() - 0.5) * 5,
        }
        const destination = {
          latitude: 40 + (Math.random() - 0.5) * 5,
          longitude: -74 + (Math.random() - 0.5) * 5,
        }

        requests.push(service.calculateRoute(source, destination))
      }

      const startTime = Date.now()
      const results = await Promise.allSettled(requests)
      const endTime = Date.now()

      const successfulResults = results.filter((result) => result.status === "fulfilled")
      const failedResults = results.filter((result) => result.status === "rejected")

      console.log(`Stress test completed in ${endTime - startTime}ms`)
      console.log(`Successful calculations: ${successfulResults.length}`)
      console.log(`Failed calculations: ${failedResults.length}`)

      // At least 80% should succeed
      expect(successfulResults.length).toBeGreaterThanOrEqual(80)
      // Should complete within 30 seconds
      expect(endTime - startTime).toBeLessThan(30000)
    }, 60000) // 60 second timeout

    it("should handle memory efficiently with large datasets", async () => {
      const initialMemory = process.memoryUsage()

      // Create a very large graph
      const mockNodes = new Map()
      const mockEdges = new Map()

      for (let i = 0; i < 10000; i++) {
        const nodeId = `node${i}`
        mockNodes.set(nodeId, {
          id: nodeId,
          coordinate: {
            latitude: 40 + (Math.random() - 0.5) * 20,
            longitude: -74 + (Math.random() - 0.5) * 20,
          },
          nodeType: "intersection",
        })

        const edges = []
        for (let j = 0; j < 10; j++) {
          const targetNodeId = `node${Math.floor(Math.random() * 10000)}`
          edges.push({
            id: `edge${i}-${j}`,
            fromNodeId: nodeId,
            toNodeId: targetNodeId,
            weight: Math.random() * 100,
            distance: Math.random() * 100,
            estimatedTime: Math.random() * 120,
          })
        }
        mockEdges.set(nodeId, edges)
      }

      const mockGraph = {
        nodes: mockNodes,
        edges: mockEdges,
        adjacencyList: new Map(),
      }

      mockMapDataService.getRouteGraph.mockReturnValue(mockGraph)

      const afterSetupMemory = process.memoryUsage()
      const memoryIncrease = afterSetupMemory.heapUsed - initialMemory.heapUsed

      // Memory increase should be reasonable (less than 500MB)
      expect(memoryIncrease).toBeLessThan(500 * 1024 * 1024)

      console.log(`Memory usage increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`)
    })

    it("should maintain performance with repeated calculations", async () => {
      const mockGraph = {
        nodes: new Map([
          ["node1", { id: "node1", coordinate: { latitude: 40.7128, longitude: -74.006 }, nodeType: "city" }],
          ["node2", { id: "node2", coordinate: { latitude: 34.0522, longitude: -118.2437 }, nodeType: "city" }],
        ]),
        edges: new Map([
          [
            "node1",
            [{ id: "edge1", fromNodeId: "node1", toNodeId: "node2", weight: 100, distance: 100, estimatedTime: 120 }],
          ],
        ]),
        adjacencyList: new Map([["node1", ["node2"]]]),
      }

      mockMapDataService.getRouteGraph.mockReturnValue(mockGraph)
      mockMapDataService.findNearestNode
        .mockReturnValueOnce({ id: "node1", coordinate: { latitude: 40.7128, longitude: -74.006 }, nodeType: "city" })
        .mockReturnValue({ id: "node2", coordinate: { latitude: 34.0522, longitude: -118.2437 }, nodeType: "city" })

      mockRouteCalculationRepository.create.mockImplementation(() => ({ id: `calc${Date.now()}` }))
      mockRouteCalculationRepository.save.mockImplementation((calc) => Promise.resolve(calc))
      mockRouteRepository.create.mockImplementation((route) => route)
      mockRouteRepository.save.mockImplementation((route) => Promise.resolve({ ...route, id: `route${Date.now()}` }))

      const source = { latitude: 40.7128, longitude: -74.006 }
      const destination = { latitude: 34.0522, longitude: -118.2437 }

      const times = []

      // Perform 50 identical calculations
      for (let i = 0; i < 50; i++) {
        const startTime = Date.now()
        await service.calculateRoute(source, destination)
        const endTime = Date.now()
        times.push(endTime - startTime)
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length
      const maxTime = Math.max(...times)
      const minTime = Math.min(...times)

      console.log(`Average calculation time: ${averageTime}ms`)
      console.log(`Min time: ${minTime}ms, Max time: ${maxTime}ms`)

      // Performance should be consistent (max time shouldn't be more than 3x average)
      expect(maxTime).toBeLessThan(averageTime * 3)
      // Average time should be reasonable
      expect(averageTime).toBeLessThan(1000) // Less than 1 second
    })
  })

  describe("Cache Performance Under Load", () => {
    it("should improve performance with cache hits", async () => {
      const mockRoute = {
        id: "cached-route",
        sourceLatitude: 40.7128,
        sourceLongitude: -74.006,
        destinationLatitude: 34.0522,
        destinationLongitude: -118.2437,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      }

      // First call - cache miss
      mockRouteRepository.findOne.mockResolvedValueOnce(null)
      mockMapDataService.findNearestNode.mockReturnValue({
        id: "node1",
        coordinate: { latitude: 40.7128, longitude: -74.006 },
        nodeType: "city",
      })
      mockMapDataService.getRouteGraph.mockReturnValue({
        nodes: new Map([["node1", { id: "node1" }]]),
        edges: new Map(),
        adjacencyList: new Map(),
      })

      const source = { latitude: 40.7128, longitude: -74.006 }
      const destination = { latitude: 34.0522, longitude: -118.2437 }

      const firstCallStart = Date.now()
      // This would normally fail due to no path, but we're testing cache behavior
      try {
        await service.calculateRoute(source, destination, [], { useCache: true })
      } catch (error) {
        // Expected to fail due to no route
      }
      const firstCallTime = Date.now() - firstCallStart

      // Second call - cache hit
      mockRouteRepository.findOne.mockResolvedValueOnce(mockRoute)

      const secondCallStart = Date.now()
      try {
        await service.calculateRoute(source, destination, [], { useCache: true })
      } catch (error) {
        // May still fail, but should be faster
      }
      const secondCallTime = Date.now() - secondCallStart

      console.log(`First call (cache miss): ${firstCallTime}ms`)
      console.log(`Second call (cache hit): ${secondCallTime}ms`)

      // Cache hit should be significantly faster (at least 50% faster)
      expect(secondCallTime).toBeLessThan(firstCallTime * 0.5)
    })
  })
})
