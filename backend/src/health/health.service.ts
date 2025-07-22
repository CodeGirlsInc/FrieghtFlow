import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { type Repository, Between, type FindOptionsWhere } from "typeorm"
import type { HealthCheck } from "./entities/health-check.entity"
import { HealthStatus, ServiceType } from "./entities/health-check.entity"
import type { OverallHealthDto, ServiceHealthDto, HealthHistoryDto } from "./dto/health-response.dto"
import type { FilterHealthChecksDto } from "./dto/filter-health-checks.dto"
import type { HealthChecker } from "./interfaces/health-checker.interface"

export interface PaginatedHealthChecks {
  data: HealthCheck[]
  total: number
  page: number
  limit: number
  totalPages: number
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name)
  private readonly checkers = new Map<string, HealthChecker>()
  private readonly startTime = Date.now()

  constructor(private readonly healthCheckRepository: Repository<HealthCheck>) {}

  registerChecker(checker: HealthChecker): void {
    this.checkers.set(checker.getServiceName(), checker)
    this.logger.log(`Registered health checker: ${checker.getServiceName()}`)
  }

  async checkOverallHealth(): Promise<OverallHealthDto> {
    const timestamp = new Date()
    const services: ServiceHealthDto[] = []

    // Run all health checks in parallel
    const checkPromises = Array.from(this.checkers.entries()).map(async ([serviceName, checker]) => {
      try {
        const result = await checker.check()
        const serviceHealth: ServiceHealthDto = {
          serviceName,
          serviceType: this.getServiceType(serviceName),
          status: result.status,
          responseTime: result.responseTime,
          details: result.details,
          errorMessage: result.errorMessage,
          checkedAt: timestamp,
        }

        // Save to database
        await this.saveHealthCheck(serviceHealth)

        return serviceHealth
      } catch (error) {
        this.logger.error(`Health check failed for ${serviceName}`, error.stack)
        const errorHealth: ServiceHealthDto = {
          serviceName,
          serviceType: this.getServiceType(serviceName),
          status: HealthStatus.UNHEALTHY,
          responseTime: 0,
          errorMessage: error.message,
          checkedAt: timestamp,
        }

        await this.saveHealthCheck(errorHealth)
        return errorHealth
      }
    })

    const serviceResults = await Promise.all(checkPromises)
    services.push(...serviceResults)

    // Calculate overall status
    const summary = {
      total: services.length,
      healthy: services.filter((s) => s.status === HealthStatus.HEALTHY).length,
      degraded: services.filter((s) => s.status === HealthStatus.DEGRADED).length,
      unhealthy: services.filter((s) => s.status === HealthStatus.UNHEALTHY).length,
    }

    let overallStatus = HealthStatus.HEALTHY
    if (summary.unhealthy > 0) {
      overallStatus = HealthStatus.UNHEALTHY
    } else if (summary.degraded > 0) {
      overallStatus = HealthStatus.DEGRADED
    }

    return {
      status: overallStatus,
      timestamp,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      services,
      summary,
    }
  }

  async getServiceHealth(serviceName: string): Promise<ServiceHealthDto | null> {
    const checker = this.checkers.get(serviceName)
    if (!checker) {
      return null
    }

    try {
      const result = await checker.check()
      return {
        serviceName,
        serviceType: this.getServiceType(serviceName),
        status: result.status,
        responseTime: result.responseTime,
        details: result.details,
        errorMessage: result.errorMessage,
        checkedAt: new Date(),
      }
    } catch (error) {
      this.logger.error(`Health check failed for ${serviceName}`, error.stack)
      return {
        serviceName,
        serviceType: this.getServiceType(serviceName),
        status: HealthStatus.UNHEALTHY,
        responseTime: 0,
        errorMessage: error.message,
        checkedAt: new Date(),
      }
    }
  }

  async getHealthHistory(serviceName: string, hours = 24): Promise<HealthHistoryDto> {
    const startDate = new Date()
    startDate.setHours(startDate.getHours() - hours)

    const checks = await this.healthCheckRepository.find({
      where: {
        serviceName,
        createdAt: Between(startDate, new Date()),
      },
      order: { createdAt: "ASC" },
      take: 1000, // Limit to prevent memory issues
    })

    return {
      serviceName,
      checks: checks.map((check) => ({
        status: check.status,
        responseTime: check.responseTime,
        checkedAt: check.checkedAt,
        errorMessage: check.errorMessage,
      })),
    }
  }

  async findAll(filterDto: FilterHealthChecksDto): Promise<PaginatedHealthChecks> {
    const { page = 1, limit = 50, sortByDateDesc = true, ...filters } = filterDto

    const where: FindOptionsWhere<HealthCheck> = {}

    if (filters.serviceName) {
      where.serviceName = filters.serviceName
    }

    if (filters.serviceType) {
      where.serviceType = filters.serviceType
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.startDate || filters.endDate) {
      const startDate = filters.startDate ? new Date(filters.startDate) : new Date("1970-01-01")
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date()
      where.createdAt = Between(startDate, endDate)
    }

    const [data, total] = await this.healthCheckRepository.findAndCount({
      where,
      order: {
        createdAt: sortByDateDesc ? "DESC" : "ASC",
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getHealthStats(): Promise<{
    totalChecks: number
    recentChecks: number
    serviceStats: Array<{
      serviceName: string
      totalChecks: number
      healthyChecks: number
      degradedChecks: number
      unhealthyChecks: number
      avgResponseTime: number
    }>
  }> {
    const totalChecks = await this.healthCheckRepository.count()

    const last24Hours = new Date()
    last24Hours.setHours(last24Hours.getHours() - 24)

    const recentChecks = await this.healthCheckRepository.count({
      where: {
        createdAt: Between(last24Hours, new Date()),
      },
    })

    // Get stats per service
    const serviceStatsQuery = await this.healthCheckRepository
      .createQueryBuilder("hc")
      .select("hc.serviceName", "serviceName")
      .addSelect("COUNT(*)", "totalChecks")
      .addSelect("COUNT(CASE WHEN hc.status = 'healthy' THEN 1 END)", "healthyChecks")
      .addSelect("COUNT(CASE WHEN hc.status = 'degraded' THEN 1 END)", "degradedChecks")
      .addSelect("COUNT(CASE WHEN hc.status = 'unhealthy' THEN 1 END)", "unhealthyChecks")
      .addSelect("AVG(hc.responseTime)", "avgResponseTime")
      .where("hc.createdAt >= :startDate", { startDate: last24Hours })
      .groupBy("hc.serviceName")
      .getRawMany()

    const serviceStats = serviceStatsQuery.map((stat) => ({
      serviceName: stat.serviceName,
      totalChecks: Number.parseInt(stat.totalChecks),
      healthyChecks: Number.parseInt(stat.healthyChecks),
      degradedChecks: Number.parseInt(stat.degradedChecks),
      unhealthyChecks: Number.parseInt(stat.unhealthyChecks),
      avgResponseTime: Math.round(Number.parseFloat(stat.avgResponseTime) * 100) / 100,
    }))

    return {
      totalChecks,
      recentChecks,
      serviceStats,
    }
  }

  // Scheduled health checks
  @Cron(CronExpression.EVERY_MINUTE)
  async scheduledHealthCheck() {
    if (process.env.HEALTH_CHECK_SCHEDULED === "false") {
      return
    }

    this.logger.debug("Running scheduled health checks")
    try {
      await this.checkOverallHealth()
    } catch (error) {
      this.logger.error("Scheduled health check failed", error.stack)
    }
  }

  private async saveHealthCheck(serviceHealth: ServiceHealthDto): Promise<void> {
    try {
      const healthCheck = this.healthCheckRepository.create({
        serviceName: serviceHealth.serviceName,
        serviceType: serviceHealth.serviceType,
        status: serviceHealth.status,
        responseTime: serviceHealth.responseTime,
        details: serviceHealth.details,
        errorMessage: serviceHealth.errorMessage,
        checkedAt: serviceHealth.checkedAt,
      })

      await this.healthCheckRepository.save(healthCheck)
    } catch (error) {
      this.logger.error(`Failed to save health check for ${serviceHealth.serviceName}`, error.stack)
    }
  }

  private getServiceType(serviceName: string): ServiceType {
    const serviceTypeMap: Record<string, ServiceType> = {
      database: ServiceType.DATABASE,
      redis: ServiceType.REDIS,
      email: ServiceType.EMAIL,
      "external-apis": ServiceType.EXTERNAL_API,
      system: ServiceType.STORAGE,
      webhook: ServiceType.WEBHOOK,
      queue: ServiceType.QUEUE,
    }

    return serviceTypeMap[serviceName] || ServiceType.EXTERNAL_API
  }

  getRegisteredServices(): string[] {
    return Array.from(this.checkers.keys())
  }
}
