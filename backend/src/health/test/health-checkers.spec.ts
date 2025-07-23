import { Test, type TestingModule } from "@nestjs/testing"
import { getDataSourceToken } from "@nestjs/typeorm"
import { DatabaseHealthChecker } from "../checkers/database-health.checker"
import { RedisHealthChecker } from "../checkers/redis-health.checker"
import { EmailHealthChecker } from "../checkers/email-health.checker"
import type { SystemHealthChecker } from "../checkers/system-health.checker"
import { HealthStatus } from "../entities/health-check.entity"
import { jest } from "@jest/globals"

describe("Health Checkers", () => {
  describe("DatabaseHealthChecker", () => {
    let checker: DatabaseHealthChecker

    const mockDataSource = {
      isInitialized: true,
      query: jest.fn(),
      driver: {
        options: {
          type: "postgres",
          host: "localhost",
          port: 5432,
        },
        database: "test_db",
      },
    }

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DatabaseHealthChecker,
          {
            provide: getDataSourceToken(),
            useValue: mockDataSource,
          },
        ],
      }).compile()

      checker = module.get<DatabaseHealthChecker>(DatabaseHealthChecker)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it("should return healthy status for working database", async () => {
      mockDataSource.query
        .mockResolvedValueOnce([{ test: 1 }]) // SELECT 1 query
        .mockResolvedValueOnce([{ now: new Date() }]) // SELECT NOW() query

      const result = await checker.check()

      expect(result.status).toBe(HealthStatus.HEALTHY)
      expect(result.responseTime).toBeGreaterThan(0)
      expect(result.details).toBeDefined()
      expect(result.details!.driver).toBe("postgres")
    })

    it("should return unhealthy status for uninitialized database", async () => {
      mockDataSource.isInitialized = false

      const result = await checker.check()

      expect(result.status).toBe(HealthStatus.UNHEALTHY)
      expect(result.errorMessage).toBe("Database connection not initialized")
    })

    it("should return unhealthy status for database query failure", async () => {
      mockDataSource.query.mockRejectedValue(new Error("Connection failed"))

      const result = await checker.check()

      expect(result.status).toBe(HealthStatus.UNHEALTHY)
      expect(result.errorMessage).toBe("Connection failed")
    })

    it("should return service name", () => {
      expect(checker.getServiceName()).toBe("database")
    })
  })

  describe("RedisHealthChecker", () => {
    let checker: RedisHealthChecker

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [RedisHealthChecker],
      }).compile()

      checker = module.get<RedisHealthChecker>(RedisHealthChecker)
    })

    it("should return healthy status for working Redis", async () => {
      const result = await checker.check()

      expect(result.status).toBe(HealthStatus.HEALTHY)
      expect(result.responseTime).toBeGreaterThan(0)
      expect(result.details).toBeDefined()
      expect(result.details!.ping).toBe("PONG")
    })

    it("should return service name", () => {
      expect(checker.getServiceName()).toBe("redis")
    })
  })

  describe("EmailHealthChecker", () => {
    let checker: EmailHealthChecker

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [EmailHealthChecker],
      }).compile()

      checker = module.get<EmailHealthChecker>(EmailHealthChecker)
    })

    it("should return healthy status for working email service", async () => {
      const result = await checker.check()

      expect(result.status).toBe(HealthStatus.HEALTHY)
      expect(result.responseTime).toBeGreaterThan(0)
      expect(result.details).toBeDefined()
      expect(result.details!.verified).toBe(true)
    })

    it("should return service name", () => {
      expect(checker.getServiceName()).toBe("email")
    })
  })

  describe("SystemHealthChecker", () => {
    let checker: SystemHealthChecker

    beforeEach(async () => {
