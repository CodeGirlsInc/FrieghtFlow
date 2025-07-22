import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ScheduleModule } from "@nestjs/schedule"
import { HealthService } from "./health.service"
import { HealthController } from "./health.controller"
import { HealthCheck } from "./entities/health-check.entity"
import { DatabaseHealthChecker } from "./checkers/database-health.checker"
import { RedisHealthChecker } from "./checkers/redis-health.checker"
import { EmailHealthChecker } from "./checkers/email-health.checker"
import { ExternalApiHealthChecker } from "./checkers/external-api-health.checker"
import { SystemHealthChecker } from "./checkers/system-health.checker"

@Module({
  imports: [TypeOrmModule.forFeature([HealthCheck]), ScheduleModule.forRoot()],
  controllers: [HealthController],
  providers: [
    HealthService,
    DatabaseHealthChecker,
    RedisHealthChecker,
    EmailHealthChecker,
    ExternalApiHealthChecker,
    SystemHealthChecker,
  ],
  exports: [HealthService],
})
export class HealthModule {
  constructor(
    private readonly healthService: HealthService,
    private readonly databaseChecker: DatabaseHealthChecker,
    private readonly redisChecker: RedisHealthChecker,
    private readonly emailChecker: EmailHealthChecker,
    private readonly externalApiChecker: ExternalApiHealthChecker,
    private readonly systemChecker: SystemHealthChecker,
  ) {
    // Register all health checkers
    this.healthService.registerChecker(this.databaseChecker)
    this.healthService.registerChecker(this.redisChecker)
    this.healthService.registerChecker(this.emailChecker)
    this.healthService.registerChecker(this.externalApiChecker)
    this.healthService.registerChecker(this.systemChecker)
  }
}
