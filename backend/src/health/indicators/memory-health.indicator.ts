import { Injectable } from "@nestjs/common"
import { HealthIndicator, type HealthIndicatorResult } from "@nestjs/terminus"
import * as os from "os"

@Injectable()
export class MemoryHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const memoryUsage = process.memoryUsage()
    const systemMemory = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
    }

    const memoryData = {
      process: {
        rss: this.formatBytes(memoryUsage.rss),
        heapTotal: this.formatBytes(memoryUsage.heapTotal),
        heapUsed: this.formatBytes(memoryUsage.heapUsed),
        external: this.formatBytes(memoryUsage.external),
        arrayBuffers: this.formatBytes(memoryUsage.arrayBuffers),
      },
      system: {
        total: this.formatBytes(systemMemory.total),
        free: this.formatBytes(systemMemory.free),
        used: this.formatBytes(systemMemory.used),
        usagePercent: Math.round((systemMemory.used / systemMemory.total) * 100 * 100) / 100,
      },
      thresholds: {
        heapWarning: "150MB",
        heapCritical: "200MB",
        systemWarning: "80%",
        systemCritical: "90%",
      },
    }

    // Check if memory usage is within acceptable limits
    const heapUsedMB = memoryUsage.heapUsed / (1024 * 1024)
    const systemUsagePercent = (systemMemory.used / systemMemory.total) * 100

    const isHealthy = heapUsedMB < 200 && systemUsagePercent < 90

    return this.getStatus(key, isHealthy, memoryData)
  }

  private formatBytes(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }
}
