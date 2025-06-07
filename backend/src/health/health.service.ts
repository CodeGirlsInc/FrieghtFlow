import { Injectable } from "@nestjs/common"
import type { DataSource } from "typeorm"
import { makeCounterProvider, makeGaugeProvider, makeHistogramProvider } from "@willsoto/nestjs-prometheus"
import type { Counter, Gauge, Histogram } from "prom-client"
import * as os from "os"
import * as process from "process"

@Injectable()
export class HealthService {
  private readonly startTime: Date
  private readonly httpRequestsTotal: Counter<string>
  private readonly httpRequestDuration: Histogram<string>
  private readonly memoryUsage: Gauge<string>
  private readonly cpuUsage: Gauge<string>
  private readonly activeConnections: Gauge<string>

  constructor(private readonly dataSource: DataSource) {
    this.startTime = new Date()

    // Initialize Prometheus metrics
    this.httpRequestsTotal = makeCounterProvider({
      name: "freightflow_http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code"],
    })

    this.httpRequestDuration = makeHistogramProvider({
      name: "freightflow_http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "route"],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    })

    this.memoryUsage = makeGaugeProvider({
      name: "freightflow_memory_usage_bytes",
      help: "Memory usage in bytes",
      labelNames: ["type"],
    })

    this.cpuUsage = makeGaugeProvider({
      name: "freightflow_cpu_usage_percent",
      help: "CPU usage percentage",
    })

    this.activeConnections = makeGaugeProvider({
      name: "freightflow_active_connections",
      help: "Number of active database connections",
    })

    // Update metrics periodically
    this.startMetricsCollection()
  }

  async getDetailedMetrics() {
    const memoryUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    const uptime = process.uptime()

    // Database metrics
    const dbMetrics = await this.getDatabaseMetrics()

    // System metrics
    const systemMetrics = {
      cpu: {
        usage: this.calculateCpuUsage(cpuUsage),
        loadAverage: os.loadavg(),
        cores: os.cpus().length,
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
        process: {
          rss: memoryUsage.rss,
          heapTotal: memoryUsage.heapTotal,
          heapUsed: memoryUsage.heapUsed,
          external: memoryUsage.external,
          arrayBuffers: memoryUsage.arrayBuffers,
        },
      },
      uptime: {
        process: uptime,
        system: os.uptime(),
        application: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      },
      platform: {
        arch: os.arch(),
        platform: os.platform(),
        release: os.release(),
        hostname: os.hostname(),
        nodeVersion: process.version,
      },
    }

    return {
      database: dbMetrics,
      system: systemMetrics,
      application: {
        startTime: this.startTime.toISOString(),
        uptime: uptime,
        pid: process.pid,
        version: process.env.APP_VERSION || "1.0.0",
        environment: process.env.NODE_ENV || "development",
      },
    }
  }

  private async getDatabaseMetrics() {
    try {
      const queryRunner = this.dataSource.createQueryRunner()
      await queryRunner.connect()

      // Get database size
      const dbSizeResult = await queryRunner.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size,
               pg_database_size(current_database()) as size_bytes
      `)

      // Get connection stats
      const connectionStats = await queryRunner.query(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `)

      // Get table stats
      const tableStats = await queryRunner.query(`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
        LIMIT 10
      `)

      // Get slow queries (if pg_stat_statements is enabled)
      let slowQueries = []
      try {
        slowQueries = await queryRunner.query(`
          SELECT 
            query,
            calls,
            total_time,
            mean_time,
            rows
          FROM pg_stat_statements
          ORDER BY mean_time DESC
          LIMIT 5
        `)
      } catch (error) {
        // pg_stat_statements extension not available
        slowQueries = []
      }

      await queryRunner.release()

      return {
        connected: true,
        size: dbSizeResult[0],
        connections: connectionStats[0],
        tables: tableStats,
        slowQueries,
        pool: {
          total: this.dataSource.options.extra?.max || 10,
          active: this.dataSource.isInitialized ? 1 : 0,
          idle: 0,
        },
      }
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      }
    }
  }

  private calculateCpuUsage(cpuUsage: NodeJS.CpuUsage): number {
    const totalUsage = cpuUsage.user + cpuUsage.system
    return (totalUsage / 1000000) * 100 // Convert microseconds to percentage
  }

  private startMetricsCollection() {
    // Update metrics every 30 seconds
    setInterval(() => {
      this.updateMetrics()
    }, 30000)

    // Initial update
    this.updateMetrics()
  }

  private updateMetrics() {
    const memoryUsage = process.memoryUsage()

    // Update memory metrics
    this.memoryUsage.set({ type: "rss" }, memoryUsage.rss)
    this.memoryUsage.set({ type: "heap_total" }, memoryUsage.heapTotal)
    this.memoryUsage.set({ type: "heap_used" }, memoryUsage.heapUsed)
    this.memoryUsage.set({ type: "external" }, memoryUsage.external)

    // Update CPU metrics
    const cpuUsage = process.cpuUsage()
    this.cpuUsage.set(this.calculateCpuUsage(cpuUsage))

    // Update database connection metrics
    if (this.dataSource.isInitialized) {
      this.activeConnections.set(1) // Simplified - in real app, get actual connection count
    }
  }

  // Method to record HTTP request metrics
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() })
    this.httpRequestDuration.observe({ method, route }, duration / 1000) // Convert to seconds
  }

  getUptime(): number {
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000)
  }

  getStartTime(): Date {
    return this.startTime
  }
}
