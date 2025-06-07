import { Injectable } from "@nestjs/common"
import { HealthIndicator, type HealthIndicatorResult, HealthCheckError } from "@nestjs/terminus"
import type { DataSource } from "typeorm"

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly dataSource: DataSource) {
    super()
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const startTime = Date.now()

      // Test basic connectivity
      await this.dataSource.query("SELECT 1")

      const responseTime = Date.now() - startTime

      // Get additional database info
      const [versionResult] = await this.dataSource.query("SELECT version()")
      const [uptimeResult] = await this.dataSource.query(`
        SELECT EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) as uptime_seconds
      `)

      const result = this.getStatus(key, true, {
        connection: "active",
        responseTime: `${responseTime}ms`,
        version: versionResult.version.split(" ")[0] + " " + versionResult.version.split(" ")[1],
        uptime: Math.floor(uptimeResult.uptime_seconds),
        database: this.dataSource.options.database,
        host: this.dataSource.options.host,
        port: this.dataSource.options.port,
      })

      return result
    } catch (error) {
      const result = this.getStatus(key, false, {
        connection: "failed",
        error: error.message,
      })

      throw new HealthCheckError("Database health check failed", result)
    }
  }
}
