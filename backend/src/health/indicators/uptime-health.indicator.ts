import { Injectable } from "@nestjs/common"
import { HealthIndicator, type HealthIndicatorResult } from "@nestjs/terminus"
import * as os from "os"

@Injectable()
export class UptimeHealthIndicator extends HealthIndicator {
  private readonly startTime: Date

  constructor() {
    super()
    this.startTime = new Date()
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const processUptime = process.uptime()
    const systemUptime = os.uptime()
    const applicationUptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000)

    const uptimeData = {
      application: {
        seconds: applicationUptime,
        formatted: this.formatUptime(applicationUptime),
        startTime: this.startTime.toISOString(),
      },
      process: {
        seconds: Math.floor(processUptime),
        formatted: this.formatUptime(processUptime),
      },
      system: {
        seconds: Math.floor(systemUptime),
        formatted: this.formatUptime(systemUptime),
      },
      status: "healthy",
    }

    // Application is considered healthy if it has been running for more than 10 seconds
    const isHealthy = applicationUptime > 10

    return this.getStatus(key, isHealthy, uptimeData)
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    const parts = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

    return parts.join(" ")
  }
}
