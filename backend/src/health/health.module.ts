import { Module } from "@nestjs/common"
import { TerminusModule } from "@nestjs/terminus"
import { HttpModule } from "@nestjs/axios"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PrometheusModule } from "@willsoto/nestjs-prometheus"
import { HealthController } from "./health.controller"
import { HealthService } from "./health.service"
import { DatabaseHealthIndicator } from "./indicators/database-health.indicator"
import { MemoryHealthIndicator } from "./indicators/memory-health.indicator"
import { UptimeHealthIndicator } from "./indicators/uptime-health.indicator"
import { RedisHealthIndicator } from "./indicators/redis-health.indicator"
import { DiskHealthIndicator } from "./indicators/disk-health.indicator"

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    TypeOrmModule,
    PrometheusModule.register({
      path: "/metrics",
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: "freightflow_",
        },
      },
    }),
  ],
  controllers: [HealthController],
  providers: [
    HealthService,
    DatabaseHealthIndicator,
    MemoryHealthIndicator,
    UptimeHealthIndicator,
    RedisHealthIndicator,
    DiskHealthIndicator,
  ],
  exports: [HealthService],
})
export class HealthModule {}
