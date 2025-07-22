import { Controller, Get, Query, HttpStatus, HttpCode } from "@nestjs/common"
import type { HealthService, PaginatedHealthChecks } from "./health.service"
import type { OverallHealthDto, ServiceHealthDto, HealthHistoryDto } from "./dto/health-response.dto"
import type { FilterHealthChecksDto } from "./dto/filter-health-checks.dto"
import { HealthStatus } from "./entities/health-check.entity"

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getOverallHealth(): Promise<OverallHealthDto> {
    const health = await this.healthService.checkOverallHealth()

    // Set appropriate HTTP status based on health
    if (health.status === HealthStatus.UNHEALTHY) {
      // Note: We return 200 but include status in response
      // Some load balancers expect 200 for health checks
      // Adjust based on your requirements
    }

    return health
  }

  @Get("live")
  @HttpCode(HttpStatus.OK)
  async getLiveness(): Promise<{ status: string; timestamp: Date }> {
    // Simple liveness check - just confirms the service is running
    return {
      status: "alive",
      timestamp: new Date(),
    }
  }

  @Get("ready")
  async getReadiness(): Promise<{ status: string; ready: boolean; timestamp: Date }> {
    // Readiness check - confirms the service is ready to handle requests
    const health = await this.healthService.checkOverallHealth()
    const ready = health.status !== HealthStatus.UNHEALTHY

    return {
      status: ready ? "ready" : "not ready",
      ready,
      timestamp: new Date(),
    }
  }

  @Get("services")
  async getServices(): Promise<{ services: string[] }> {
    return {
      services: this.healthService.getRegisteredServices(),
    }
  }

  @Get("service/:serviceName")
  async getServiceHealth(serviceName: string): Promise<ServiceHealthDto | null> {
    return this.healthService.getServiceHealth(serviceName)
  }

  @Get("service/:serviceName/history")
  async getServiceHistory(serviceName: string, @Query("hours") hours?: number): Promise<HealthHistoryDto> {
    return this.healthService.getHealthHistory(serviceName, hours ? Number.parseInt(hours.toString()) : 24)
  }

  @Get("checks")
  async getHealthChecks(@Query() filterDto: FilterHealthChecksDto): Promise<PaginatedHealthChecks> {
    return this.healthService.findAll(filterDto)
  }

  @Get("stats")
  async getHealthStats() {
    return this.healthService.getHealthStats()
  }
}
