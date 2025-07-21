import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { AuditLogService } from "./audit-log.service"
import { AuditLog, AuditAction } from "./entities/audit-log.entity"
import { jest } from "@jest/globals"

describe("AuditLogService", () => {
  let service: AuditLogService
  let repository: Repository<AuditLog>

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<AuditLogService>(AuditLogService)
    repository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("createLog", () => {
    it("should create and save an audit log", async () => {
      const createDto = {
        action: AuditAction.USER_CREATED,
        userId: "user-123",
        userEmail: "test@example.com",
        entityType: "User",
        entityId: "user-123",
        newValues: { name: "John Doe" },
      }

      const mockAuditLog = { id: "log-123", ...createDto, createdAt: new Date() }

      mockRepository.create.mockReturnValue(mockAuditLog)
      mockRepository.save.mockResolvedValue(mockAuditLog)

      const result = await service.createLog(createDto)

      expect(mockRepository.create).toHaveBeenCalledWith(createDto)
      expect(mockRepository.save).toHaveBeenCalledWith(mockAuditLog)
      expect(result).toEqual(mockAuditLog)
    })

    it("should handle errors during log creation", async () => {
      const createDto = {
        action: AuditAction.USER_CREATED,
        userId: "user-123",
      }

      mockRepository.create.mockReturnValue(createDto)
      mockRepository.save.mockRejectedValue(new Error("Database error"))

      await expect(service.createLog(createDto)).rejects.toThrow("Database error")
    })
  })

  describe("findAll", () => {
    it("should return paginated audit logs with filters", async () => {
      const queryDto = {
        limit: 10,
        offset: 0,
        action: AuditAction.USER_CREATED,
        userId: "user-123",
      }

      const mockLogs = [
        { id: "log-1", action: AuditAction.USER_CREATED, userId: "user-123" },
        { id: "log-2", action: AuditAction.USER_CREATED, userId: "user-123" },
      ]

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockLogs, 2])

      const result = await service.findAll(queryDto)

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("audit_log")
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("audit_log.action = :action", {
        action: AuditAction.USER_CREATED,
      })
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("audit_log.userId = :userId", { userId: "user-123" })
      expect(result).toEqual({ logs: mockLogs, total: 2 })
    })

    it("should handle search queries", async () => {
      const queryDto = {
        limit: 10,
        offset: 0,
        search: "test@example.com",
      }

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0])

      await service.findAll(queryDto)

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "(audit_log.userEmail ILIKE :search OR audit_log.entityType ILIKE :search OR audit_log.source ILIKE :search)",
        { search: "%test@example.com%" },
      )
    })
  })

  describe("findByUser", () => {
    it("should return audit logs for a specific user", async () => {
      const userId = "user-123"
      const mockLogs = [{ id: "log-1", userId }]

      mockRepository.find.mockResolvedValue(mockLogs)

      const result = await service.findByUser(userId)

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: "DESC" },
        take: 20,
      })
      expect(result).toEqual(mockLogs)
    })
  })

  describe("logUserCreation", () => {
    it("should create a user creation audit log", async () => {
      const userId = "user-123"
      const userEmail = "test@example.com"
      const userData = { name: "John Doe" }

      const mockLog = {
        id: "log-123",
        action: AuditAction.USER_CREATED,
        userId,
        userEmail,
        entityType: "User",
        entityId: userId,
        newValues: userData,
        source: "user-service",
      }

      mockRepository.create.mockReturnValue(mockLog)
      mockRepository.save.mockResolvedValue(mockLog)

      const result = await service.logUserCreation(userId, userEmail, userData)

      expect(mockRepository.create).toHaveBeenCalledWith({
        action: AuditAction.USER_CREATED,
        userId,
        userEmail,
        entityType: "User",
        entityId: userId,
        newValues: userData,
        metadata: undefined,
        source: "user-service",
      })
      expect(result).toEqual(mockLog)
    })
  })
})
