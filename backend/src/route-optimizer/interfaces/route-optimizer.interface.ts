export interface Coordinate {
  latitude: number
  longitude: number
}

export interface GraphNode {
  id: string
  coordinate: Coordinate
  nodeType: string
  properties?: Record<string, any>
}

export interface GraphEdge {
  id: string
  fromNodeId: string
  toNodeId: string
  weight: number
  distance: number
  estimatedTime: number
  properties?: Record<string, any>
}

export interface RouteGraph {
  nodes: Map<string, GraphNode>
  edges: Map<string, GraphEdge[]>
  adjacencyList: Map<string, string[]>
}

export interface DijkstraResult {
  distances: Map<string, number>
  previous: Map<string, string | null>
  path: string[]
  totalDistance: number
  totalTime: number
  nodesEvaluated: number
}

export interface RouteCalculationOptions {
  optimizationCriteria: string
  avoidTolls?: boolean
  avoidHighways?: boolean
  vehicleType?: string
  maxDistance?: number
  includeAlternatives?: boolean
  useCache?: boolean
}

export interface RouteOptimizerConfig {
  cacheExpirationMinutes: number
  maxCacheSize: number
  maxCalculationTime: number
  enableAlternativeRoutes: boolean
  defaultOptimizationCriteria: string
  maxWaypoints: number
  maxRouteDistance: number
}

export interface PerformanceMetrics {
  calculationTime: number
  memoryUsage: number
  cacheHitRate: number
  nodesEvaluated: number
  edgesEvaluated: number
}

export interface RouteAlternative {
  id: string
  path: string[]
  distance: number
  duration: number
  cost?: number
  description: string
  avoidanceFactors: string[]
}

export interface TrafficData {
  edgeId: string
  currentMultiplier: number
  historicalAverage: number
  lastUpdated: Date
  incidents: Array<{
    type: string
    severity: number
    description: string
  }>
}
