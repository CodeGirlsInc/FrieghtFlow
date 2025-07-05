import { Injectable, Logger, type OnModuleInit } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type MapNode, NodeType } from "../entities/map-node.entity"
import { type MapEdge, RoadType, RoadCondition } from "../entities/map-edge.entity"
import type { RouteGraph, GraphNode, GraphEdge, Coordinate } from "../interfaces/route-optimizer.interface"

@Injectable()
export class MapDataService implements OnModuleInit {
  private readonly logger = new Logger(MapDataService.name)
  private routeGraph: RouteGraph
  private readonly EARTH_RADIUS_KM = 6371

  constructor(
    private readonly mapNodeRepository: Repository<MapNode>,
    private readonly mapEdgeRepository: Repository<MapEdge>,
  ) {
    this.routeGraph = {
      nodes: new Map(),
      edges: new Map(),
      adjacencyList: new Map(),
    }
  }

  async onModuleInit() {
    await this.initializeMapData()
    await this.loadGraphData()
  }

  /**
   * Initialize mock map data if database is empty
   */
  private async initializeMapData(): Promise<void> {
    const nodeCount = await this.mapNodeRepository.count()
    if (nodeCount === 0) {
      this.logger.log("Initializing mock map data...")
      await this.generateMockMapData()
    }
  }

  /**
   * Generate comprehensive mock map data
   */
  private async generateMockMapData(): Promise<void> {
    const nodes: Partial<MapNode>[] = []
    const edges: Partial<MapEdge>[] = []

    // Generate nodes for major US cities and surrounding areas
    const cityData = [
      { name: "New York City", lat: 40.7128, lng: -74.006, type: NodeType.CITY_CENTER },
      { name: "Los Angeles", lat: 34.0522, lng: -118.2437, type: NodeType.CITY_CENTER },
      { name: "Chicago", lat: 41.8781, lng: -87.6298, type: NodeType.CITY_CENTER },
      { name: "Houston", lat: 29.7604, lng: -95.3698, type: NodeType.CITY_CENTER },
      { name: "Phoenix", lat: 33.4484, lng: -112.074, type: NodeType.CITY_CENTER },
      { name: "Philadelphia", lat: 39.9526, lng: -75.1652, type: NodeType.CITY_CENTER },
      { name: "San Antonio", lat: 29.4241, lng: -98.4936, type: NodeType.CITY_CENTER },
      { name: "San Diego", lat: 32.7157, lng: -117.1611, type: NodeType.CITY_CENTER },
      { name: "Dallas", lat: 32.7767, lng: -96.797, type: NodeType.CITY_CENTER },
      { name: "San Jose", lat: 37.3382, lng: -121.8863, type: NodeType.CITY_CENTER },
    ]

    // Create city center nodes
    for (const city of cityData) {
      nodes.push({
        name: city.name,
        latitude: city.lat,
        longitude: city.lng,
        nodeType: city.type,
        properties: {
          city: city.name,
          trafficLevel: Math.floor(Math.random() * 5) + 5, // High traffic in cities
        },
        isActive: true,
      })
    }

    // Generate surrounding nodes for each city
    for (const city of cityData) {
      // Generate warehouse nodes
      for (let i = 0; i < 3; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.2 // ~11km radius
        const offsetLng = (Math.random() - 0.5) * 0.2
        nodes.push({
          name: `${city.name} Warehouse ${i + 1}`,
          latitude: city.lat + offsetLat,
          longitude: city.lng + offsetLng,
          nodeType: NodeType.WAREHOUSE,
          properties: {
            city: city.name,
            trafficLevel: Math.floor(Math.random() * 3) + 2,
            operatingHours: { open: "06:00", close: "22:00" },
          },
          isActive: true,
        })
      }

      // Generate delivery points
      for (let i = 0; i < 10; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.3
        const offsetLng = (Math.random() - 0.5) * 0.3
        nodes.push({
          name: `${city.name} Delivery Point ${i + 1}`,
          latitude: city.lat + offsetLat,
          longitude: city.lng + offsetLng,
          nodeType: NodeType.DELIVERY_POINT,
          properties: {
            city: city.name,
            trafficLevel: Math.floor(Math.random() * 4) + 1,
            address: `${Math.floor(Math.random() * 9999)} Main St`,
          },
          isActive: true,
        })
      }

      // Generate intersections
      for (let i = 0; i < 20; i++) {
        const offsetLat = (Math.random() - 0.5) * 0.4
        const offsetLng = (Math.random() - 0.5) * 0.4
        nodes.push({
          name: `${city.name} Intersection ${i + 1}`,
          latitude: city.lat + offsetLat,
          longitude: city.lng + offsetLng,
          nodeType: NodeType.INTERSECTION,
          properties: {
            city: city.name,
            trafficLevel: Math.floor(Math.random() * 6) + 1,
          },
          isActive: true,
        })
      }
    }

    // Generate highway junctions between cities
    for (let i = 0; i < cityData.length - 1; i++) {
      for (let j = i + 1; j < cityData.length; j++) {
        const city1 = cityData[i]
        const city2 = cityData[j]
        const midLat = (city1.lat + city2.lat) / 2
        const midLng = (city1.lng + city2.lng) / 2

        nodes.push({
          name: `Highway Junction ${city1.name}-${city2.name}`,
          latitude: midLat,
          longitude: midLng,
          nodeType: NodeType.HIGHWAY_JUNCTION,
          properties: {
            trafficLevel: Math.floor(Math.random() * 3) + 1,
            connectsCities: [city1.name, city2.name],
          },
          isActive: true,
        })
      }
    }

    // Save nodes to database
    const savedNodes = await this.mapNodeRepository.save(nodes)
    this.logger.log(`Created ${savedNodes.length} map nodes`)

    // Generate edges between nodes
    for (let i = 0; i < savedNodes.length; i++) {
      const node1 = savedNodes[i]

      // Connect to nearby nodes
      for (let j = i + 1; j < savedNodes.length; j++) {
        const node2 = savedNodes[j]
        const distance = this.calculateDistance(
          { latitude: node1.latitude, longitude: node1.longitude },
          { latitude: node2.latitude, longitude: node2.longitude },
        )

        // Only connect nodes within reasonable distance
        if (distance <= 50) {
          // 50km max
          const roadType = this.determineRoadType(node1, node2, distance)
          const speedLimit = this.getSpeedLimitForRoadType(roadType)
          const estimatedTime = Math.round((distance / speedLimit) * 60) // minutes

          edges.push({
            fromNodeId: node1.id,
            toNodeId: node2.id,
            distance,
            estimatedTime,
            roadType,
            roadCondition: this.getRandomRoadCondition(),
            speedLimit,
            trafficMultiplier: this.getTrafficMultiplier(node1, node2),
            isBidirectional: true,
            isActive: true,
            properties: {
              tollCost: roadType === RoadType.HIGHWAY ? Math.random() * 10 : 0,
            },
          })

          // Create reverse edge for bidirectional roads
          edges.push({
            fromNodeId: node2.id,
            toNodeId: node1.id,
            distance,
            estimatedTime,
            roadType,
            roadCondition: this.getRandomRoadCondition(),
            speedLimit,
            trafficMultiplier: this.getTrafficMultiplier(node2, node1),
            isBidirectional: true,
            isActive: true,
            properties: {
              tollCost: roadType === RoadType.HIGHWAY ? Math.random() * 10 : 0,
            },
          })
        }
      }
    }

    // Save edges to database
    const savedEdges = await this.mapEdgeRepository.save(edges)
    this.logger.log(`Created ${savedEdges.length} map edges`)
  }

  /**
   * Load graph data from database into memory
   */
  private async loadGraphData(): Promise<void> {
    this.logger.log("Loading graph data into memory...")

    const nodes = await this.mapNodeRepository.find({ where: { isActive: true } })
    const edges = await this.mapEdgeRepository.find({
      where: { isActive: true },
      relations: ["fromNode", "toNode"],
    })

    // Build nodes map
    for (const node of nodes) {
      const graphNode: GraphNode = {
        id: node.id,
        coordinate: {
          latitude: node.latitude,
          longitude: node.longitude,
        },
        nodeType: node.nodeType,
        properties: node.properties,
      }
      this.routeGraph.nodes.set(node.id, graphNode)
    }

    // Build edges map and adjacency list
    for (const edge of edges) {
      const graphEdge: GraphEdge = {
        id: edge.id,
        fromNodeId: edge.fromNodeId,
        toNodeId: edge.toNodeId,
        weight: this.calculateEdgeWeight(edge),
        distance: edge.distance,
        estimatedTime: edge.estimatedTime,
        properties: edge.properties,
      }

      // Add to edges map
      if (!this.routeGraph.edges.has(edge.fromNodeId)) {
        this.routeGraph.edges.set(edge.fromNodeId, [])
      }
      this.routeGraph.edges.get(edge.fromNodeId)!.push(graphEdge)

      // Add to adjacency list
      if (!this.routeGraph.adjacencyList.has(edge.fromNodeId)) {
        this.routeGraph.adjacencyList.set(edge.fromNodeId, [])
      }
      this.routeGraph.adjacencyList.get(edge.fromNodeId)!.push(edge.toNodeId)
    }

    this.logger.log(`Loaded ${nodes.length} nodes and ${edges.length} edges into graph`)
  }

  /**
   * Get the route graph
   */
  getRouteGraph(): RouteGraph {
    return this.routeGraph
  }

  /**
   * Find nearest node to given coordinates
   */
  findNearestNode(coordinate: Coordinate): GraphNode | null {
    let nearestNode: GraphNode | null = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const node of this.routeGraph.nodes.values()) {
      const distance = this.calculateDistance(coordinate, node.coordinate)
      if (distance < minDistance) {
        minDistance = distance
        nearestNode = node
      }
    }

    return nearestNode
  }

  /**
   * Get nodes within radius of coordinate
   */
  getNodesWithinRadius(coordinate: Coordinate, radiusKm: number): GraphNode[] {
    const nodesInRadius: GraphNode[] = []

    for (const node of this.routeGraph.nodes.values()) {
      const distance = this.calculateDistance(coordinate, node.coordinate)
      if (distance <= radiusKm) {
        nodesInRadius.push(node)
      }
    }

    return nodesInRadius.sort((a, b) => {
      const distA = this.calculateDistance(coordinate, a.coordinate)
      const distB = this.calculateDistance(coordinate, b.coordinate)
      return distA - distB
    })
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
    const lat1Rad = (coord1.latitude * Math.PI) / 180
    const lat2Rad = (coord2.latitude * Math.PI) / 180
    const deltaLatRad = ((coord2.latitude - coord1.latitude) * Math.PI) / 180
    const deltaLngRad = ((coord2.longitude - coord1.longitude) * Math.PI) / 180

    const a =
      Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return this.EARTH_RADIUS_KM * c
  }

  /**
   * Calculate edge weight based on optimization criteria
   */
  private calculateEdgeWeight(edge: MapEdge): number {
    // Base weight is distance
    let weight = edge.distance

    // Apply traffic multiplier
    weight *= edge.trafficMultiplier

    // Apply road condition penalty
    switch (edge.roadCondition) {
      case RoadCondition.POOR:
        weight *= 1.5
        break
      case RoadCondition.CONSTRUCTION:
        weight *= 2.0
        break
      case RoadCondition.FAIR:
        weight *= 1.2
        break
    }

    return weight
  }

  /**
   * Determine road type based on node types and distance
   */
  private determineRoadType(node1: MapNode, node2: MapNode, distance: number): RoadType {
    if (distance > 20) return RoadType.HIGHWAY
    if (node1.nodeType === NodeType.CITY_CENTER || node2.nodeType === NodeType.CITY_CENTER) {
      return RoadType.ARTERIAL
    }
    if (node1.nodeType === NodeType.WAREHOUSE || node2.nodeType === NodeType.WAREHOUSE) {
      return RoadType.COMMERCIAL
    }
    if (node1.nodeType === NodeType.RESIDENTIAL || node2.nodeType === NodeType.RESIDENTIAL) {
      return RoadType.RESIDENTIAL
    }
    return RoadType.LOCAL
  }

  /**
   * Get speed limit for road type
   */
  private getSpeedLimitForRoadType(roadType: RoadType): number {
    switch (roadType) {
      case RoadType.HIGHWAY:
        return 110
      case RoadType.ARTERIAL:
        return 60
      case RoadType.COLLECTOR:
        return 50
      case RoadType.COMMERCIAL:
        return 40
      case RoadType.RESIDENTIAL:
        return 30
      default:
        return 50
    }
  }

  /**
   * Get random road condition
   */
  private getRandomRoadCondition(): RoadCondition {
    const conditions = Object.values(RoadCondition)
    const weights = [0.3, 0.4, 0.2, 0.08, 0.02] // Excellent, Good, Fair, Poor, Construction
    const random = Math.random()
    let cumulative = 0

    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i]
      if (random <= cumulative) {
        return conditions[i]
      }
    }

    return RoadCondition.GOOD
  }

  /**
   * Calculate traffic multiplier based on node properties
   */
  private getTrafficMultiplier(fromNode: MapNode, toNode: MapNode): number {
    const avgTrafficLevel = ((fromNode.properties?.trafficLevel || 1) + (toNode.properties?.trafficLevel || 1)) / 2
    return 1 + (avgTrafficLevel - 1) * 0.1 // 1.0 to 1.9 multiplier
  }

  /**
   * Refresh graph data from database
   */
  async refreshGraphData(): Promise<void> {
    this.routeGraph = {
      nodes: new Map(),
      edges: new Map(),
      adjacencyList: new Map(),
    }
    await this.loadGraphData()
  }

  /**
   * Get graph statistics
   */
  getGraphStatistics(): {
    nodeCount: number
    edgeCount: number
    avgDegree: number
    nodeTypes: Record<string, number>
  } {
    const nodeCount = this.routeGraph.nodes.size
    const edgeCount = Array.from(this.routeGraph.edges.values()).reduce((sum, edges) => sum + edges.length, 0)
    const avgDegree = nodeCount > 0 ? edgeCount / nodeCount : 0

    const nodeTypes: Record<string, number> = {}
    for (const node of this.routeGraph.nodes.values()) {
      nodeTypes[node.nodeType] = (nodeTypes[node.nodeType] || 0) + 1
    }

    return {
      nodeCount,
      edgeCount,
      avgDegree,
      nodeTypes,
    }
  }
}
