import { Injectable } from "@nestjs/common"
import { LogLevel, type LogMetrics } from "../interfaces/logger.interface"
import * as os from "os"

@Injectable()
export class MetricsService {
  private metrics: LogMetrics = {
    totalLogs: 0,
    logsByLevel: {
      [LogLevel.FATAL]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.DEBUG]: 0,
      [LogLevel.TRACE]: 0,
    },
    errorRate: 0,
    averageResponseTime: 0,
    peakMemoryUsage: 0,
    activeConnections: 0,
    lastLogTime: new Date(),
  }

  private responseTimes: number[] = []
  private readonly maxResponseTimesSamples = 1000
  private startTime = Date.now()

  incrementLogCount(level: LogLevel): void {
    this.metrics.totalLogs++
    this.metrics.logsByLevel[level]++
    this.metrics.lastLogTime = new Date()
    this.updateErrorRate()
    this.updateMemoryUsage()
  }

  recordResponseTime(duration: number): void {
    this.responseTimes.push(duration)

    if (this.responseTimes.length > this.maxResponseTimesSamples) {
      this.responseTimes.shift()
    }

    this.updateAverageResponseTime()
  }

  incrementActiveConnections(): void {
    this.metrics.activeConnections++
  }

  decrementActiveConnections(): void {
    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1)
  }

  getMetrics(): LogMetrics {
    return { ...this.metrics }
  }

  getDetailedMetrics(): any {
    const uptime = Date.now() - this.startTime
    const memoryUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()

    return {
      ...this.metrics,
      uptime,
      memoryUsage: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers,
      },
      cpuUsage: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      systemInfo: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        hostname: os.hostname(),
        loadAverage: os.loadavg(),
        freeMemory: os.freemem(),
        totalMemory: os.totalmem(),
      },
      logRates: this.calculateLogRates(),
      percentiles: this.calculateResponseTimePercentiles(),
    }
  }

  private updateErrorRate(): void {
    const errorLogs = this.metrics.logsByLevel[LogLevel.ERROR] + this.metrics.logsByLevel[LogLevel.FATAL]
    this.metrics.errorRate = this.metrics.totalLogs > 0 ? (errorLogs / this.metrics.totalLogs) * 100 : 0
  }

  private updateAverageResponseTime(): void {
    if (this.responseTimes.length > 0) {
      const sum = this.responseTimes.reduce((acc, time) => acc + time, 0)
      this.metrics.averageResponseTime = sum / this.responseTimes.length
    }
  }

  private updateMemoryUsage(): void {
    const currentMemory = process.memoryUsage().heapUsed
    if (currentMemory > this.metrics.peakMemoryUsage) {
      this.metrics.peakMemoryUsage = currentMemory
    }
  }

  private calculateLogRates(): any {
    const uptime = (Date.now() - this.startTime) / 1000 // in seconds

    return {
      logsPerSecond: this.metrics.totalLogs / uptime,
      errorsPerSecond: (this.metrics.logsByLevel[LogLevel.ERROR] + this.metrics.logsByLevel[LogLevel.FATAL]) / uptime,
      warningsPerSecond: this.metrics.logsByLevel[LogLevel.WARN] / uptime,
    }
  }

  private calculateResponseTimePercentiles(): any {
    if (this.responseTimes.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0 }
    }

    const sorted = [...this.responseTimes].sort((a, b) => a - b)
    const length = sorted.length

    return {
      p50: sorted[Math.floor(length * 0.5)],
      p90: sorted[Math.floor(length * 0.9)],
      p95: sorted[Math.floor(length * 0.95)],
      p99: sorted[Math.floor(length * 0.99)],
      min: sorted[0],
      max: sorted[length - 1],
    }
  }

  reset(): void {
    this.metrics = {
      totalLogs: 0,
      logsByLevel: {
        [LogLevel.FATAL]: 0,
        [LogLevel.ERROR]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.DEBUG]: 0,
        [LogLevel.TRACE]: 0,
      },
      errorRate: 0,
      averageResponseTime: 0,
      peakMemoryUsage: 0,
      activeConnections: 0,
      lastLogTime: new Date(),
    }
    this.responseTimes = []
    this.startTime = Date.now()
  }

  exportMetrics(): string {
    const metrics = this.getDetailedMetrics()

    // Export in Prometheus format
    let output = ""
    output += `# HELP freightflow_logs_total Total number of logs\n`
    output += `# TYPE freightflow_logs_total counter\n`
    output += `freightflow_logs_total ${metrics.totalLogs}\n\n`

    output += `# HELP freightflow_logs_by_level Number of logs by level\n`
    output += `# TYPE freightflow_logs_by_level counter\n`
    Object.entries(metrics.logsByLevel).forEach(([level, count]) => {
      output += `freightflow_logs_by_level{level="${level}"} ${count}\n`
    })
    output += "\n"

    output += `# HELP freightflow_error_rate Error rate percentage\n`
    output += `# TYPE freightflow_error_rate gauge\n`
    output += `freightflow_error_rate ${metrics.errorRate}\n\n`

    output += `# HELP freightflow_response_time_avg Average response time\n`
    output += `# TYPE freightflow_response_time_avg gauge\n`
    output += `freightflow_response_time_avg ${metrics.averageResponseTime}\n\n`

    output += `# HELP freightflow_memory_usage Memory usage in bytes\n`
    output += `# TYPE freightflow_memory_usage gauge\n`
    output += `freightflow_memory_usage{type="heap_used"} ${metrics.memoryUsage.heapUsed}\n`
    output += `freightflow_memory_usage{type="heap_total"} ${metrics.memoryUsage.heapTotal}\n`
    output += `freightflow_memory_usage{type="rss"} ${metrics.memoryUsage.rss}\n\n`

    return output
  }
}
