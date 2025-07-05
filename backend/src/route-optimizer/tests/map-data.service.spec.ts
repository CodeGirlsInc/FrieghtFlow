import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { MapDataService } from "../services/map-data.service"
import { MapNode, NodeType } from "../entities/map-node.entity"
import { MapEdge } from "../entities/map-edge.entity"
import { jest } from "@jest/globals"

describe("MapDataService", () => {
  let service: MapDataService
  let mapNodeRepository: Repository<MapNode>
  let mapEdgeRepository: Repository<MapEdge>

  const mockMapNodeRepository = {
    count: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  }

  const mockMapEdgeRepository = {
    find: jest.fn(),
    save: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapDataService,
        {
          provide: getRepositoryToken(MapNode),
          useValue: mockMapNodeRepository,
        },
        {
          provide: getRepositoryToken(MapEdge),
          useValue: mockMapEdgeRepository,
        },
      ],
    }).compile()

    service = module.get<MapDataService>(MapDataService)
    mapNodeRepository = module.get<Repository<MapNode>>(getRepositoryToken(MapNode))
    mapEdgeRepository = module.get<Repository<MapEdge>>(getRepositoryToken(MapEdge))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("calculateDistance", () => {
    it("should calculate distance between two coordinates correctly", () => {
      const coord1 = { latitude: 40.7128, longitude: -74.006 } // New York
      const coord2 = { latitude: 34.0522, longitude: -118.2437 } // Los Angeles

      const distance = service.calculateDistance(coord1, coord2)

      // Distance between NYC and LA is approximately 3944 km
      expect(distance).toBeGreaterThan(3900)
      expect(distance).toBeLessThan(4000)
    })

    it("should return 0 for identical coordinates", () => {
      const coord = { latitude: 40.7128, longitude: -74.006 }

      const distance = service.calculateDistance(coord, coord)

      expect(distance).toBe(0)
    })
  })

  describe("findNearestNode", () => {
    it("should find the nearest node to given coordinates", async () => {
      const mockNodes = [
        {
          id: "node1",
          latitude: 40.7128,
          longitude: -74.006,
          nodeType: NodeType.CITY_CENTER,
        },
        {
          id: "node2",
          latitude: 40.7589,
          longitude: -73.9851,
          nodeType: NodeType.INTERSECTION,
        },
      ]

      mockMapNodeRepository.find.mockResolvedValue(mockNodes)
      mockMapEdgeRepository.find.mockResolvedValue([])

      await service.onModuleInit()

      const searchCoord = { latitude: 40.72, longitude: -74.0 }
      const nearestNode = service.findNearestNode(searchCoord)

      expect(nearestNode).toBeDefined()
      expect(nearestNode!.id).toBe("node1") // Should be closer to node1
    })

    it("should return null when no nodes exist", async () => {
      mockMapNodeRepository.find.mockResolvedValue([])
      mockMapEdgeRepository.find.mockResolvedValue([])

      await service.onModuleInit()

      const searchCoord = { latitude: 40.7128, longitude: -74.006 }
      const nearestNode = service.findNearestNode(searchCoord)

      expect(nearestNode).toBeNull()
    })
  })

  describe("getNodesWithinRadius", () => {
    it("should return nodes within specified radius", async () => {
      const mockNodes = [
        {
          id: "node1",
          latitude: 40.7128,
          longitude: -74.006,
          nodeType: NodeType.CITY_CENTER,
        },
        {
          id: "node2",
          latitude: 40.7589,
          longitude: -73.9851,
          nodeType: NodeType.INTERSECTION,
        },
        {
          id: "node3",
          latitude: 41.0,
          longitude: -75.0,
          nodeType: NodeType.WAREHOUSE,
        },
      ]

      mockMapNodeRepository.find.mockResolvedValue(mockNodes)
      mockMapEdgeRepository.find.mockResolvedValue([])

      await service.onModuleInit()

      const searchCoord = { latitude: 40.7128, longitude: -74.006 }
      const nodesInRadius = service.getNodesWithinRadius(searchCoord, 10) // 10km radius

      expect(nodesInRadius.length).toBeGreaterThan(0)
      expect(nodesInRadius[0].id).toBe("node1") // Should include the closest node
    })

    it("should return empty array when no nodes within radius", async () => {
      const mockNodes = [
        {
          id: "node1",
          latitude: 50.0,
          longitude: -80.0,
          nodeType: NodeType.CITY_CENTER,
        },
      ]

      mockMapNodeRepository.find.mockResolvedValue(mockNodes)
      mockMapEdgeRepository.find.mockResolvedValue([])

      await service.onModuleInit()

      const searchCoord = { latitude: 40.7128, longitude: -74.006 }
      const nodesInRadius = service.getNodesWithinRadius(searchCoord, 1) // 1km radius

      expect(nodesInRadius).toHaveLength(0)
    })
  })

  describe("getGraphStatistics", () => {
    it("should return correct graph statistics", async () => {
      const mockNodes = [
        { id: "node1", nodeType: NodeType.CITY_CENTER },
        { id: "node2", nodeType: NodeType.INTERSECTION },
        { id: "node3", nodeType: NodeType.WAREHOUSE },
      ]

      const mockEdges = [
        { fromNodeId: "node1", toNodeId: "node2" },
        { fromNodeId: "node2", toNodeId: "node3" },
      ]

      mockMapNodeRepository.find.mockResolvedValue(mockNodes)
      mockMapEdgeRepository.find.mockResolvedValue(mockEdges)

      await service.onModuleInit()

      const stats = service.getGraphStatistics()

      expect(stats.nodeCount).toBe(3)
      expect(stats.edgeCount).toBe(2)
      expect(stats.nodeTypes[NodeType.CITY_CENTER]).toBe(1)
      expect(stats.nodeTypes[NodeType.INTERSECTION]).toBe(1)
      expect(stats.nodeTypes[NodeType.WAREHOUSE]).toBe(1)
    })
  })
})
