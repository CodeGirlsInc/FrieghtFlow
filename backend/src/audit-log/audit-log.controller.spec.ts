import { Test, type TestingModule } from "@nestjs/testing"
import { AuditLogController } from "./audit-log.controller"
import { AuditLogService } from "./audit-log.service"
import { AuditAction } from "./entities/audit-log.entity"
import { jest } from "@jest/globals"

describe("AuditLogController", () => {
  let controller: AuditLogController
  let service: AuditLogService

  const mockAuditLogService = {
    findAll: jest.fn(),
    getRecentLogs: jest.fn(),
    findByUser: jest.fn(),
    findByEntity: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
      ],
    }).compile()

    controller = module.get<AuditLogController>(AuditLogController)
    service = module.get<AuditLogService>(AuditLogService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("getLogs", () => {
    it("should return paginated audit logs", async () => {
      const queryDto = { limit: 10, offset: 0 }
      const mockResult = {
        logs: [{ id: "log-1", action: AuditAction.USER_CREATED }],
        total: 1,
      }

      mockAuditLogService.findAll.mockResolvedValue(mockResult)

      const result = await controller.getLogs(queryDto)

      expect(service.findAll).toHaveBeenCalledWith(queryDto)
      expect(result).toEqual({
        success: true,
        data: mockResult.logs,
        pagination: {
          total: 1,
          limit: 10,
          offset: 0,
          hasMore: false,
        },
      })
    })
  })

  describe("getRecentLogs", () => {
    it("should return recent audit logs", async () => {
      const mockLogs = [{ id: "log-1", action: AuditAction.USER_CREATED }]

      mockAuditLogService.getRecentLogs.mockResolvedValue(mockLogs)

      const result = await controller.getRecentLogs(50)

      expect(service.getRecentLogs).toHaveBeenCalledWith(50)
      expect(result).toEqual({
        success: true,
        data: mockLogs,
      })
    })
  })

  describe("getUserLogs", () => {
    it("should return logs for a specific user", async () => {
      const userId = "user-123"
      const mockLogs = [{ id: "log-1", userId }]

      mockAuditLogService.findByUser.mockResolvedValue(mockLogs)

      const result = await controller.getUserLogs(userId, 20)

      expect(service.findByUser).toHaveBeenCalledWith(userId, 20)
      expect(result).toEqual({
        success: true,
        data: mockLogs,
      })
    })
  })
})
