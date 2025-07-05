import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type Route, RouteStatus } from "../entities/route.entity"
import { type RouteCalculation, CalculationStatus } from "../entities/route-calculation.entity"

@Injectable()
export class RouteStorageService {
  private readonly logger = new Logger(RouteStorageService.name)

  constructor(
    private readonly routeRepository: Repository<Route>,
    private readonly routeCalculationRepository: Repository<RouteCalculation>,
  ) {}

  /**
   * Store route with validation
   */
  async storeRoute(routeData: Partial<Route>): Promise<Route> {
    const route = this.routeRepository.create({
      ...routeData,
      status: RouteStatus.CALCULATED,
      calculatedAt: new Date(),
    })

    return await this.routeRepository.save(route)
  }

  /**
   * Update route status
   */
  async updateRouteStatus(routeId: string, status: RouteStatus): Promise<void> {
    await this.routeRepository.update(routeId, { status })
  }

  /**
   * Get route statistics
   */
  async getRouteStatistics(): Promise<{
    totalRoutes: number
    routesByStatus: Record<string, number>
    routesByOptimization: Record<string, number>
    averageDistance: number
    averageDuration: number
  }> {
    const routes = await this.routeRepository.find()

    const totalRoutes = routes.length
    const routesByStatus: Record<string, number> = {}
    const routesByOptimization: Record<string, number> = {}

    let totalDistance = 0
    let totalDuration = 0

    for (const route of routes) {
      routesByStatus[route.status] = (routesByStatus[route.status] || 0) + 1
      routesByOptimization[route.optimizationCriteria] = (routesByOptimization[route.optimizationCriteria] || 0) + 1
      totalDistance += route.totalDistance
      totalDuration += route.estimatedDuration
    }

    return {
      totalRoutes,
      routesByStatus,
      routesByOptimization,
      averageDistance: totalRoutes > 0 ? totalDistance / totalRoutes : 0,
      averageDuration: totalRoutes > 0 ? totalDuration / totalRoutes : 0,
    }
  }

  /**
   * Cleanup old routes
   */
  async cleanupOldRoutes(daysOld: number): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await this.routeRepository.delete({
      calculatedAt: { $lt: cutoffDate } as any,
    })

    this.logger.log(`Cleaned up ${result.affected || 0} routes older than ${daysOld} days`)
    return result.affected || 0
  }

  /**
   * Get calculation performance metrics
   */
  async getPerformanceMetrics(): Promise<{
    averageCalculationTime: number
    p95CalculationTime: number
    successRate: number
    errorRate: number
    cacheHitRate: number
  }> {
    const calculations = await this.routeCalculationRepository.find({
      order: { createdAt: "DESC" },
      take: 1000, // Last 1000 calculations
    })

    const completedCalculations = calculations.filter(
      (c) => c.status === CalculationStatus.COMPLETED && c.calculationTime,
    )
    const failedCalculations = calculations.filter((c) => c.status === CalculationStatus.FAILED)
    const cachedCalculations = calculations.filter((c) => c.status === CalculationStatus.CACHED)

    const calculationTimes = completedCalculations.map((c) => c.calculationTime!).sort((a, b) => a - b)

    const averageCalculationTime =
      calculationTimes.length > 0 ? calculationTimes.reduce((sum, time) => sum + time, 0) / calculationTimes.length : 0

    const p95Index = Math.floor(calculationTimes.length * 0.95)
    const p95CalculationTime = calculationTimes.length > 0 ? calculationTimes[p95Index] || 0 : 0

    const totalCalculations = calculations.length
    const successRate = totalCalculations > 0 ? (completedCalculations.length / totalCalculations) * 100 : 0
    const errorRate = totalCalculations > 0 ? (failedCalculations.length / totalCalculations) * 100 : 0
    const cacheHitRate = totalCalculations > 0 ? (cachedCalculations.length / totalCalculations) * 100 : 0

    return {
      averageCalculationTime: Math.round(averageCalculationTime),
      p95CalculationTime: Math.round(p95CalculationTime),
      successRate: Math.round(successRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    }
  }
}
