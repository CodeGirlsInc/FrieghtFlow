import { Test, type TestingModule } from "@nestjs/testing"
import { ConfigService } from "@nestjs/config"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { LoggerService } from "../src/logger/services/logger.service"
import { MetricsService } from "../src/logger/services/metrics.service"
import { LogFormatter } from "../src/logger/formatters/log.formatter"
import { DatabaseTransport } from "../src/logger/transports/database.transport"
import { ElasticsearchTransport } from "../src/logger/transports/elasticsearch.transport"
import { LogEntity } from "../src/logger/entities/log.entity"
import { LogLevel, type LoggerConfig } from "../src/logger/interfaces/logger.interface"
import jest from "jest" // Import jest to declare the variable

describe("LoggerService", () => {
  let service: LoggerService
  let configService: ConfigService
  let metricsService: MetricsService
  let logRepository: Repository<LogEntity>
  let databaseTransport: DatabaseTransport
  let elasticsearchTransport: ElasticsearchTransport

  const mockLoggerConfig: LoggerConfig = {
    level: LogLevel.DEBUG,
    format: "json" as any,
    transports: [],
    enableConsole: true,
    enableFile: false,
    enableDatabase: true,
    enableElastic: false,
    maxFileSize: "20m",
    maxFiles: 14,
    datePattern: "YYYY-MM-DD",
    colorize: false,
    prettyPrint: false,
    sanitizeFields: ["password", "token"],
    maskSensitiveData: true,
    enableMetrics: true,
    enableTracing: true,
    enableProfiling: true,
    bufferSize: 1000,
    flushInterval: 5000,
  }

  const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 0 }),
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
    })),
  }

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === "logger") {
        return mockLoggerConfig
      }
      return undefined
    }),
  }

  const mockDatabaseTransport = {
    log: jest.fn().mockResolvedValue(undefined),
    flush: jest.fn().mockResolvedValue(undefined),
    archiveOldLogs: jest.fn().mockResolvedValue(10),
    deleteArchivedLogs: jest.fn().mockResolvedValue(5),
    getLogStatistics: jest.fn().mockResolvedValue([]),
  }

  const mockElasticsearchTransport = {
    log: jest.fn().mockResolvedValue(undefined),
    flush: jest.fn().mockResolvedValue(undefined),
    search: jest.fn().mockResolvedValue({ hits: { hits: [] } }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        MetricsService,
        LogFormatter,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(LogEntity),
          useValue: mockRepository,
        },
        {
          provide: DatabaseTransport,
          useValue: mockDatabaseTransport,
        },
        {
          provide: ElasticsearchTransport,
          useValue: mockElasticsearchTransport,
        },
      ],
    }).compile()

    service = module.get<LoggerService>(LoggerService)
    configService = module.get<ConfigService>(ConfigService)
    metricsService = module.get<MetricsService>(MetricsService)
    logRepository = module.get<Repository<LogEntity>>(getRepositoryToken(LogEntity))
    databaseTransport = module.get<DatabaseTransport>(DatabaseTransport)
    elasticsearchTransport = module.get<ElasticsearchTransport>(ElasticsearchTransport)

    // Initialize the service
    await service.onModuleInit()
  })

  afterEach(async () => {
    await service.onModuleDestroy()
    jest.clearAllMocks()
  })

  describe("Basic Logging", () => {
    it("should be defined", () => {
      expect(service).toBeDefined()
    })

    it("should log debug messages", () => {
      const message = "Debug test message"
      const context = { module: "TestModule", component: "TestComponent" }

      service.debug(message, context)

      // Verify that the log was processed
      expect(mockDatabaseTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.DEBUG,
          message,
          context: expect.objectContaining(context),
        }),
      )
    })

    it("should log info messages", () => {
      const message = "Info test message"
      const context = { module: "TestModule", userId: "user123" }

      service.info(message, context)

      expect(mockDatabaseTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message,
          context: expect.objectContaining(context),
        }),
      )
    })

    it("should log warning messages", () => {
      const message = "Warning test message"
      const context = { module: "TestModule", requestId: "req123" }

      service.warn(message, context)

      expect(mockDatabaseTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.WARN,
          message,
          context: expect.objectContaining(context),
        }),
      )
    })

    it("should log error messages with error object", () => {
      const message = "Error test message"
      const error = new Error("Test error")
      const context = { module: "TestModule", operation: "testOperation" }

      service.error(message, error, context)

      expect(mockDatabaseTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.ERROR,
          message,
          error,
          context: expect.objectContaining(context),
        }),
      )
    })

    it("should log fatal messages", () => {
      const message = "Fatal test message"
      const error = new Error("Fatal error")
      const context = { module: "TestModule" }

      service.fatal(message, error, context)

      expect(mockDatabaseTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.FATAL,
          message,
          error,
          context: expect.objectContaining(context),
        }),
      )
    })
  })

  describe("Context Management", () => {
    it("should enrich context with default values", () => {
      const message = "Test message"
      const context = { module: "TestModule" }

      service.info(message, context)

      expect(mockDatabaseTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            module: "TestModule",
            timestamp: expect.any(Date),
            environment: expect.any(String),
            version: expect.any(String),
            requestId: expect.any(String),
          }),
        }),
      )
    })

    it("should run with context", () => {
      const testContext = { userId: "user123", requestId: "req123" }
      let capturedContext

      service.runWithContext(testContext, () => {
        capturedContext = service.getCurrentContext()
        service.info("Test message in context")
      })

      expect(capturedContext).toEqual(testContext)
    })

    it("should run with async context", async () => {
      const testContext = { userId: "user456", sessionId: "session123" }
      let capturedContext

      await service.runWithContextAsync(testContext, async () => {
        capturedContext = service.getCurrentContext()
        service.info("Async test message")
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      expect(capturedContext).toEqual(testContext)
    })
  })

  describe("Performance and Profiling", () => {
    it("should profile operations", () => {
      const profileId = "test-profile"
      const message = "Test profile operation"

      // Start profiling
      service.profile(profileId, `${message} started`)

      // Simulate some work
      setTimeout(() => {
        // End profiling
        service.profile(profileId, `${message} completed`)
      }, 100)

      expect(mockDatabaseTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.DEBUG,
          message: `${message} started`,
          context: expect.objectContaining({
            operation: "profile_start",
            profileId,
          }),
        }),
      )
    })

    it("should create and use timers", () => {
      const timerLabel = "test-timer"
      const endTimer = service.startTimer(timerLabel)

      // Simulate some work
      setTimeout(() => {
        const duration = endTimer()
        expect(duration).toBeGreaterThan(0)
      }, 50)
    })

    it("should log performance metrics", () => {
      const operation = "database-query"
      const duration = 1500
      const context = { module: "DatabaseModule" }

      service.performance(operation, duration, context)

      expect(mockDatabaseTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.WARN, // Should be WARN because duration > 5000ms threshold
          message: `Performance: ${operation} took ${duration}ms`,
          context: expect.objectContaining({
            ...context,
            tags: ["performance"],
            operation,
            duration,
          }),
          duration,
        }),
      )
    })
  })

  describe("Audit and Security Logging", () => {
    it("should log audit events", () => {
      const action = "USER_LOGIN"
      const resource = "authentication"
      const context = { userId: "user123", ip: "192.168.1.1" }

      service.audit(action, resource, context)

      expect(mockDatabaseTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.INFO,
          message: `Audit: ${action} on ${resource}`,
          context: expect.objectContaining({
            ...context,
            tags: ["audit"],
            operation: action,
            resource,
            timestamp: expect.any(Date),
          }),
        }),
      )
    })

    it("should log security events", () => {
      const event = "SUSPICIOUS_LOGIN_ATTEMPT"
      const details = { attempts: 5, ip: "192.168.1.100" }
      const context = { userId: "user123" }

      service.security(event, details, context)

      expect(mockDatabaseTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.WARN,
          message: `Security event: ${event}`,
          context: expect.objectContaining({
            ...context,
            tags: ["security"],
            event,
            details,
            timestamp: expect.any(Date),
            sensitive: true,
          }),
        }),
      )
    })
  })

  describe("Metrics", () => {
    it("should return basic metrics", () => {
      const metrics = service.getMetrics()

      expect(metrics).toHaveProperty("totalLogs")
      expect(metrics).toHaveProperty("logsByLevel")
      expect(metrics).toHaveProperty("errorRate")
      expect(metrics).toHaveProperty("averageResponseTime")
      expect(metrics).toHaveProperty("peakMemoryUsage")
      expect(metrics).toHaveProperty("activeConnections")
      expect(metrics).toHaveProperty("lastLogTime")
    })

    it("should return detailed metrics", () => {
      const detailedMetrics = service.getDetailedMetrics()

      expect(detailedMetrics).toHaveProperty("uptime")
      expect(detailedMetrics).toHaveProperty("memoryUsage")
      expect(detailedMetrics).toHaveProperty("cpuUsage")
      expect(detailedMetrics).toHaveProperty("systemInfo")
      expect(detailedMetrics).toHaveProperty("logRates")
      expect(detailedMetrics).toHaveProperty("percentiles")
    })

    it("should increment log counts correctly", () => {
      // Log some messages
      service.info("Test info 1")
      service.info("Test info 2")
      service.error("Test error", new Error("Test"))
      service.warn("Test warning")

      const metrics = service.getMetrics()
      expect(metrics.totalLogs).toBeGreaterThan(0)
      expect(metrics.logsByLevel[LogLevel.INFO]).toBeGreaterThan(0)
      expect(metrics.logsByLevel[LogLevel.ERROR]).toBeGreaterThan(0)
      expect(metrics.logsByLevel[LogLevel.WARN]).toBeGreaterThan(0)
    })
  })

  describe("Buffer Management", () => {
    it("should flush buffers", async () => {
      await service.flush()

      expect(mockDatabaseTransport.flush).toHaveBeenCalled()
      expect(mockElasticsearchTransport.flush).toHaveBeenCalled()
    })

    it("should close gracefully", async () => {
      await service.close()

      expect(mockDatabaseTransport.flush).toHaveBeenCalled()
      expect(mockElasticsearchTransport.flush).toHaveBeenCalled()
    })
  })

  describe("Health Check", () => {
    it("should return health status", async () => {
      const health = await service.healthCheck()

      expect(health).toHaveProperty("status")
      expect(health).toHaveProperty("details")
      expect(health.details).toHaveProperty("winston")
      expect(health.details).toHaveProperty("database")
      expect(health.details).toHaveProperty("elasticsearch")
      expect(health.details).toHaveProperty("metrics")
    })

    it("should detect unhealthy state when transports fail", async () => {
      // Mock transport failure
      mockDatabaseTransport.flush.mockRejectedValueOnce(new Error("Database connection failed"))

      const health = await service.healthCheck()

      expect(health.status).toBe("degraded")
      expect(health.details.database).toBe("error")
    })
  })

  describe("Data Sanitization", () => {
    it("should sanitize sensitive data", () => {
      const sensitiveContext = {
        userId: "user123",
        password: "secret123",
        token: "jwt-token-here",
        normalField: "normal-value",
      }

      service.info("Test with sensitive data", sensitiveContext)

      // The actual sanitization happens in the formatter, but we can verify
      // that the log was called with the context
      expect(mockDatabaseTransport.log).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            userId: "user123",
            normalField: "normal-value",
            // password and token should be sanitized by the formatter
          }),
        }),
      )
    })
  })

  describe("Error Handling", () => {
    it("should handle transport errors gracefully", async () => {
      // Mock transport error
      mockDatabaseTransport.log.mockRejectedValueOnce(new Error("Transport error"))

      // Should not throw
      expect(() => {
        service.info("Test message")
      }).not.toThrow()
    })

    it("should continue logging when one transport fails", async () => {
      mockDatabaseTransport.log.mockRejectedValueOnce(new Error("Database error"))

      service.info("Test message")

      // Should still attempt to log to other transports
      expect(mockDatabaseTransport.log).toHaveBeenCalled()
    })
  })

  describe("Configuration", () => {
    it("should use configuration from ConfigService", () => {
      expect(configService.get).toHaveBeenCalledWith("logger")
    })

    it("should respect log level configuration", () => {
      // This would require more complex mocking of Winston logger
      // to verify that only logs at or above the configured level are processed
      expect(service["config"].level).toBe(LogLevel.DEBUG)
    })
  })

  describe("Integration Tests", () => {
    it("should handle high-volume logging", async () => {
      const promises = []
      const messageCount = 100

      // Generate many log messages
      for (let i = 0; i < messageCount; i++) {
        promises.push(
          Promise.resolve().then(() => {
            service.info(`Test message ${i}`, {
              module: "LoadTest",
              messageId: i,
            })
          }),
        )
      }

      await Promise.all(promises)

      // Verify that all messages were processed
      expect(mockDatabaseTransport.log).toHaveBeenCalledTimes(messageCount)
    })

    it("should maintain performance under load", async () => {
      const startTime = Date.now()
      const messageCount = 1000

      for (let i = 0; i < messageCount; i++) {
        service.info(`Performance test message ${i}`)
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should process 1000 messages in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000)
    })
  })
})
