import { Injectable, type OnModuleInit, type OnModuleDestroy } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import * as winston from "winston"
import * as DailyRotateFile from "winston-daily-rotate-file"
import {
  type ILoggerService,
  type LogEntry,
  type LogContext,
  LogLevel,
  type LoggerConfig,
  type LogMetrics,
} from "../interfaces/logger.interface"
import type { LogFormatter } from "../formatters/log.formatter"
import type { DatabaseTransport } from "../transports/database.transport"
import type { ElasticsearchTransport } from "../transports/elasticsearch.transport"
import type { MetricsService } from "./metrics.service"
import { AsyncLocalStorage } from "async_hooks"

@Injectable()
export class LoggerService implements ILoggerService, OnModuleInit, OnModuleDestroy {
  private logger: winston.Logger
  private config: LoggerConfig
  private timers: Map<string, number> = new Map()
  private profiles: Map<string, number> = new Map()
  private asyncLocalStorage = new AsyncLocalStorage<LogContext>()

  constructor(
    private readonly configService: ConfigService,
    private readonly logFormatter: LogFormatter,
    private readonly databaseTransport: DatabaseTransport,
    private readonly elasticsearchTransport: ElasticsearchTransport,
    private readonly metricsService: MetricsService,
  ) {
    this.config = this.configService.get<LoggerConfig>("logger")
  }

  async onModuleInit(): Promise<void> {
    await this.initializeLogger()
  }

  async onModuleDestroy(): Promise<void> {
    await this.close()
  }

  private async initializeLogger(): Promise<void> {
    const transports: winston.transport[] = []

    // Console transport
    if (this.config.enableConsole) {
      transports.push(
        new winston.transports.Console({
          level: this.config.level,
          format: this.logFormatter.createFormat(this.config.format, this.config.colorize, this.config.prettyPrint),
        }),
      )
    }

    // File transports
    if (this.config.enableFile) {
      // General log file
      transports.push(
        new DailyRotateFile({
          level: LogLevel.INFO,
          filename: "logs/freightflow-%DATE%.log",
          datePattern: this.config.datePattern,
          maxSize: this.config.maxFileSize,
          maxFiles: this.config.maxFiles,
          zippedArchive: true,
          format: this.logFormatter.createFormat(this.config.format),
        }),
      )

      // Error log file
      transports.push(
        new DailyRotateFile({
          level: LogLevel.ERROR,
          filename: "logs/freightflow-error-%DATE%.log",
          datePattern: this.config.datePattern,
          maxSize: this.config.maxFileSize,
          maxFiles: this.config.maxFiles * 2, // Keep error logs longer
          zippedArchive: true,
          format: this.logFormatter.createFormat(this.config.format),
        }),
      )

      // Audit log file for sensitive operations
      transports.push(
        new DailyRotateFile({
          level: LogLevel.INFO,
          filename: "logs/freightflow-audit-%DATE%.log",
          datePattern: this.config.datePattern,
          maxSize: this.config.maxFileSize,
          maxFiles: this.config.maxFiles * 3, // Keep audit logs even longer
          zippedArchive: true,
          format: this.logFormatter.createFormat(this.config.format),
          filter: (info) => info.tags && info.tags.includes("audit"),
        }),
      )
    }

    this.logger = winston.createLogger({
      level: this.config.level,
      format: this.logFormatter.createFormat(this.config.format),
      transports,
      exitOnError: false,
      silent: process.env.NODE_ENV === "test",
    })

    // Add error handling
    this.logger.on("error", (error) => {
      console.error("Logger error:", error)
    })

    this.info("Logger initialized successfully", {
      module: "LoggerService",
      component: "initialization",
      config: {
        level: this.config.level,
        format: this.config.format,
        transports: this.config.transports.filter((t) => t.enabled).map((t) => t.type),
      },
    })
  }

  debug(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.DEBUG,
      message,
      context: this.enrichContext(context),
    })
  }

  info(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.INFO,
      message,
      context: this.enrichContext(context),
    })
  }

  warn(message: string, context?: LogContext): void {
    this.log({
      level: LogLevel.WARN,
      message,
      context: this.enrichContext(context),
    })
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log({
      level: LogLevel.ERROR,
      message,
      error,
      context: this.enrichContext(context),
    })
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log({
      level: LogLevel.FATAL,
      message,
      error,
      context: this.enrichContext(context),
    })
  }

  log(entry: LogEntry): void {
    const enrichedEntry = this.enrichLogEntry(entry)

    // Sanitize sensitive data
    if (this.config.maskSensitiveData) {
      enrichedEntry.context = this.logFormatter.sanitizeData(enrichedEntry.context, this.config.sanitizeFields)
    }

    // Log to Winston
    this.logger.log({
      level: enrichedEntry.level,
      message: enrichedEntry.message,
      error: enrichedEntry.error,
      duration: enrichedEntry.duration,
      tags: enrichedEntry.tags,
      sensitive: enrichedEntry.sensitive,
      ...enrichedEntry.context,
    })

    // Log to database if enabled
    if (this.config.enableDatabase) {
      this.databaseTransport.log(enrichedEntry).catch((error) => {
        console.error("Failed to log to database:", error)
      })
    }

    // Log to Elasticsearch if enabled
    if (this.config.enableElastic) {
      this.elasticsearchTransport.log(enrichedEntry).catch((error) => {
        console.error("Failed to log to Elasticsearch:", error)
      })
    }

    // Update metrics
    if (this.config.enableMetrics) {
      this.metricsService.incrementLogCount(enrichedEntry.level)
      if (enrichedEntry.duration) {
        this.metricsService.recordResponseTime(enrichedEntry.duration)
      }
    }
  }

  profile(id: string, message?: string, context?: LogContext): void {
    if (this.profiles.has(id)) {
      const startTime = this.profiles.get(id)
      const duration = Date.now() - startTime
      this.profiles.delete(id)

      this.info(message || `Profile ${id} completed`, {
        ...context,
        duration,
        operation: "profile",
        profileId: id,
      })
    } else {
      this.profiles.set(id, Date.now())
      this.debug(message || `Profile ${id} started`, {
        ...context,
        operation: "profile_start",
        profileId: id,
      })
    }
  }

  startTimer(label: string): () => void {
    const startTime = Date.now()
    this.timers.set(label, startTime)

    return () => {
      const endTime = Date.now()
      const duration = endTime - startTime
      this.timers.delete(label)

      this.debug(`Timer ${label} completed`, {
        duration,
        operation: "timer",
        timerLabel: label,
      })

      return duration
    }
  }

  getMetrics(): LogMetrics {
    return this.metricsService.getMetrics()
  }

  getDetailedMetrics(): any {
    return this.metricsService.getDetailedMetrics()
  }

  async flush(): Promise<void> {
    const promises: Promise<void>[] = []

    if (this.config.enableDatabase) {
      promises.push(this.databaseTransport.flush())
    }

    if (this.config.enableElastic) {
      promises.push(this.elasticsearchTransport.flush())
    }

    await Promise.all(promises)
  }

  async close(): Promise<void> {
    await this.flush()

    if (this.logger) {
      this.logger.close()
    }
  }

  // Context management methods
  runWithContext<T>(context: LogContext, fn: () => T): T {
    return this.asyncLocalStorage.run(context, fn)
  }

  async runWithContextAsync<T>(context: LogContext, fn: () => Promise<T>): Promise<T> {
    return this.asyncLocalStorage.run(context, fn)
  }

  getCurrentContext(): LogContext | undefined {
    return this.asyncLocalStorage.getStore()
  }

  // Audit logging methods
  audit(action: string, resource: string, context?: LogContext): void {
    this.info(`Audit: ${action} on ${resource}`, {
      ...context,
      tags: ["audit"],
      operation: action,
      resource,
      timestamp: new Date(),
    })
  }

  security(event: string, details: any, context?: LogContext): void {
    this.warn(`Security event: ${event}`, {
      ...context,
      tags: ["security"],
      event,
      details,
      timestamp: new Date(),
      sensitive: true,
    })
  }

  performance(operation: string, duration: number, context?: LogContext): void {
    const level = duration > 5000 ? LogLevel.WARN : LogLevel.INFO
    this.log({
      level,
      message: `Performance: ${operation} took ${duration}ms`,
      context: {
        ...context,
        tags: ["performance"],
        operation,
        duration,
      },
      duration,
    })
  }

  private enrichContext(context?: LogContext): LogContext {
    const currentContext = this.getCurrentContext()
    const baseContext: LogContext = {
      timestamp: new Date(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.APP_VERSION || "1.0.0",
      ...currentContext,
      ...context,
    }

    // Generate request ID if not present
    if (!baseContext.requestId) {
      baseContext.requestId = this.generateRequestId()
    }

    return baseContext
  }

  private enrichLogEntry(entry: LogEntry): LogEntry {
    return {
      ...entry,
      context: {
        ...entry.context,
        timestamp: new Date(),
      },
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; details: any }> {
    const details: any = {
      winston: "ok",
      database: "unknown",
      elasticsearch: "unknown",
      metrics: "ok",
    }

    try {
      // Check database connection
      if (this.config.enableDatabase) {
        await this.databaseTransport.flush()
        details.database = "ok"
      }
    } catch (error) {
      details.database = "error"
      details.databaseError = error.message
    }

    try {
      // Check Elasticsearch connection
      if (this.config.enableElastic) {
        await this.elasticsearchTransport.flush()
        details.elasticsearch = "ok"
      }
    } catch (error) {
      details.elasticsearch = "error"
      details.elasticsearchError = error.message
    }

    const hasErrors = Object.values(details).some((status) => status === "error")

    return {
      status: hasErrors ? "degraded" : "healthy",
      details,
    }
  }
}
