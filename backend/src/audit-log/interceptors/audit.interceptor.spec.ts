import { Test, type TestingModule } from "@nestjs/testing"
import { Reflector } from "@nestjs/core"
import type { ExecutionContext, CallHandler } from "@nestjs/common"
import { of, throwError } from "rxjs"
import { AuditInterceptor } from "./audit.interceptor"
import { AuditLogService } from "../audit-log.service"
import { AuditAction } from "../entities/audit-log.entity"
import { jest } from "@jest/globals"

describe("AuditInterceptor", () => {
  let interceptor: AuditInterceptor
  let auditLogService: AuditLogService
  let reflector: Reflector

  const mockAuditLogService = {
    createLog: jest.fn(),
  }

  const mockReflector = {
    get: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile()

    interceptor = module.get<AuditInterceptor>(AuditInterceptor)
    auditLogService = module.get<AuditLogService>(AuditLogService)
    reflector = module.get<Reflector>(Reflector)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const createMockExecutionContext = (request: any): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: jest.fn(),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  })

  const createMockCallHandler = (result: any): CallHandler => ({
    handle: () => of(result),
  })

  describe("intercept", () => {
    it("should pass through when no audit options are set", (done) => {
      const mockRequest = { user: { id: "user-123" }, url: "/test", method: "GET" }
      const context = createMockExecutionContext(mockRequest)
      const next = createMockCallHandler("test result")

      mockReflector.get.mockReturnValue(undefined)

      interceptor.intercept(context, next).subscribe({
        next: (result) => {
          expect(result).toBe("test result")
          expect(auditLogService.createLog).not.toHaveBeenCalled()
          done()
        },
      })
    })

    it("should create audit log on successful request", (done) => {
      const mockRequest = {
        user: { id: "user-123", email: "test@example.com" },
        url: "/test",
        method: "POST",
        ip: "127.0.0.1",
        headers: { "user-agent": "test-agent" },
        body: { name: "test" },
        params: { id: "entity-123" },
        query: { filter: "active" },
      }

      const auditOptions = {
        action: AuditAction.USER_CREATED,
        entityType: "User",
        includeBody: true,
      }

      const context = createMockExecutionContext(mockRequest)
      const next = createMockCallHandler({ id: "result-123" })

      mockReflector.get.mockReturnValue(auditOptions)
      mockAuditLogService.createLog.mockResolvedValue({})

      interceptor.intercept(context, next).subscribe({
        next: (result) => {
          expect(result).toEqual({ id: "result-123" })
          expect(auditLogService.createLog).toHaveBeenCalledWith({
            action: AuditAction.USER_CREATED,
            userId: "user-123",
            userEmail: "test@example.com",
            entityType: "User",
            entityId: "entity-123",
            ipAddress: "127.0.0.1",
            userAgent: "test-agent",
            metadata: {
              endpoint: "/test",
              method: "POST",
              params: { id: "entity-123" },
              query: { filter: "active" },
              requestBody: { name: "test" },
              result: { id: "result-123" },
            },
            newValues: { name: "test" },
          })
          done()
        },
      })
    })

    it("should create audit log on error", (done) => {
      const mockRequest = {
        user: { id: "user-123" },
        url: "/test",
        method: "POST",
        ip: "127.0.0.1",
        headers: { "user-agent": "test-agent" },
        params: {},
        query: {},
      }

      const auditOptions = {
        action: AuditAction.USER_CREATED,
        entityType: "User",
      }

      const context = createMockExecutionContext(mockRequest)
      const next: CallHandler = {
        handle: () => throwError(() => new Error("Test error")),
      }

      mockReflector.get.mockReturnValue(auditOptions)
      mockAuditLogService.createLog.mockResolvedValue({})

      interceptor.intercept(context, next).subscribe({
        error: (error) => {
          expect(error.message).toBe("Test error")
          expect(auditLogService.createLog).toHaveBeenCalledWith({
            action: AuditAction.USER_CREATED,
            userId: "user-123",
            userEmail: undefined,
            entityType: "User",
            ipAddress: "127.0.0.1",
            userAgent: "test-agent",
            metadata: {
              endpoint: "/test",
              method: "POST",
              error: "Test error",
              params: {},
              query: {},
            },
          })
          done()
        },
      })
    })
  })
})
