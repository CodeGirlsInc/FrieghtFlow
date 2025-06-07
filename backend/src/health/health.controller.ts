import { Controller, Get } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import {
  type HealthCheckService,
  HealthCheck,
  type TypeOrmHealthIndicator,
  type MemoryHealthIndicator,
  type DiskHealthIndicator,
} from "@nestjs/terminus"
import type { HealthService } from "./health.service"
import type { DatabaseHealthIndicator } from "./indicators/database-health.indicator"
import type { UptimeHealthIndicator } from "./indicators/uptime-health.indicator"
import type { RedisHealthIndicator } from "./indicators/redis-health.indicator"
import type { PrometheusService } from "@willsoto/nestjs-prometheus"

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly healthService: HealthService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly databaseHealth: DatabaseHealthIndicator,
    private readonly uptimeHealth: UptimeHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly prometheusService: PrometheusService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get application health status" })
  @ApiResponse({
    status: 200,
    description: "Health check successful",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        info: { type: "object" },
        error: { type: "object" },
        details: { type: "object" },
      },
    },
  })
  @HealthCheck()
  async check() {
    return this.health.check([
      // Database connectivity
      () => this.db.pingCheck("database"),
      () => this.databaseHealth.isHealthy("database_detailed"),

      // Memory usage (heap should be under 150MB, RSS under 300MB)
      () => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024),
      () => this.memory.checkRSS("memory_rss", 300 * 1024 * 1024),

      // Disk usage (should be under 80%)
      () => this.disk.checkStorage("storage", { path: "/", thresholdPercent: 0.8 }),

      // Application uptime
      () => this.uptimeHealth.isHealthy("uptime"),

      // Redis connectivity (if configured)
      () => this.redisHealth.isHealthy("redis"),
    ])
  }

  @Get("live")
  @ApiOperation({ summary: "Liveness probe - basic app status" })
  @ApiResponse({ status: 200, description: "Application is alive" })
  async liveness() {
    return this.health.check([() => this.uptimeHealth.isHealthy("uptime")])
  }

  @Get("ready")
  @ApiOperation({ summary: "Readiness probe - app ready to serve traffic" })
  @ApiResponse({ status: 200, description: "Application is ready" })
  async readiness() {
    return this.health.check([
      () => this.db.pingCheck("database"),
      () => this.memory.checkHeap("memory_heap", 200 * 1024 * 1024),
    ])
  }

  @Get("detailed")
  @ApiOperation({ summary: "Detailed health information with metrics" })
  @ApiResponse({ status: 200, description: "Detailed health status" })
  async detailed() {
    const basicHealth = await this.check()
    const detailedMetrics = await this.healthService.getDetailedMetrics()

    return {
      ...basicHealth,
      metrics: detailedMetrics,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV || "development",
    }
  }

  @Get("metrics")
  @ApiOperation({ summary: "Prometheus metrics endpoint" })
  @ApiResponse({
    status: 200,
    description: "Prometheus metrics",
    content: {
      "text/plain": {
        schema: { type: "string" },
      },
    },
  })
  async metrics() {
    return this.prometheusService.register.metrics()
  }
}
