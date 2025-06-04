import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ComplianceService } from "./compliance.service"
import { ComplianceDocument, VerificationStatus, DocumentType } from "./entities/compliance-document.entity"
import { NotificationService } from "../notifications/notification.service"
import type { VerifyDocumentDto } from "./dto/verify-document.dto"
import { BadRequestException } from "@nestjs/common"

describe("ComplianceService", () => {
  let service: ComplianceService
  let repository: Repository<ComplianceDocument>
  let notificationService: NotificationService

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  }

  const mockNotificationService = {
    sendEmail: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceService,
        {
          provide: getRepositoryToken(ComplianceDocument),
          useValue: mockRepository,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile()

    service = module.get<ComplianceService>(ComplianceService)
    repository = module.get<Repository<ComplianceDocument>>(getRepositoryToken(ComplianceDocument))
    notificationService = module.get<NotificationService>(NotificationService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("create", () => {
    it("should create a compliance document", async () => {
      const createDto = {
        documentType: DocumentType.BUSINESS_REGISTRATION,
        name: "Business Registration",
        fileUrl: "https://example.com/file.pdf",
        userId: "user-id",
      }

      const mockDocument = {
        id: "doc-id",
        ...createDto,
        status: VerificationStatus.PENDING,
      }

      mockRepository.create.mockReturnValue(mockDocument)
      mockRepository.save.mockResolvedValue(mockDocument)
      jest.spyOn(service, "findOne").mockResolvedValue(mockDocument as any)

      const result = await service.create(createDto)

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        expiryDate: null,
      })
      expect(mockRepository.save).toHaveBeenCalledWith(mockDocument)
      expect(result).toEqual(mockDocument)
    })
  })

  describe("verifyDocument", () => {
    it("should approve a document", async () => {
      const documentId = "doc-id"
      const reviewerId = "reviewer-id"
      const verifyDto: VerifyDocumentDto = {
        status: VerificationStatus.APPROVED,
        notes: "Looks good",
      }

      const mockDocument = {
        id: documentId,
        status: VerificationStatus.PENDING,
        user: { email: "user@example.com", name: "Test User" },
      }

      jest.spyOn(service, "findOne").mockResolvedValueOnce(mockDocument as any)
      mockRepository.update.mockResolvedValue({ affected: 1 })
      jest.spyOn(service, "findOne").mockResolvedValueOnce({
        ...mockDocument,
        status: VerificationStatus.APPROVED,
        reviewedById: reviewerId,
        reviewedAt: expect.any(Date),
      } as any)

      const result = await service.verifyDocument(documentId, verifyDto, reviewerId)

      expect(mockRepository.update).toHaveBeenCalledWith(documentId, {
        status: VerificationStatus.APPROVED,
        rejectionReason: undefined,
        notes: "Looks good",
        reviewedById: reviewerId,
        reviewedAt: expect.any(Date),
      })
      expect(result.status).toBe(VerificationStatus.APPROVED)
    })

    it("should reject a document with reason", async () => {
      const documentId = "doc-id"
      const reviewerId = "reviewer-id"
      const verifyDto: VerifyDocumentDto = {
        status: VerificationStatus.REJECTED,
        rejectionReason: "Document expired",
        notes: "Please submit a valid document",
      }

      const mockDocument = {
        id: documentId,
        status: VerificationStatus.PENDING,
        user: { email: "user@example.com", name: "Test User" },
      }

      jest.spyOn(service, "findOne").mockResolvedValueOnce(mockDocument as any)
      mockRepository.update.mockResolvedValue({ affected: 1 })
      jest.spyOn(service, "findOne").mockResolvedValueOnce({
        ...mockDocument,
        status: VerificationStatus.REJECTED,
        rejectionReason: "Document expired",
        reviewedById: reviewerId,
        reviewedAt: expect.any(Date),
      } as any)

      const result = await service.verifyDocument(documentId, verifyDto, reviewerId)

      expect(mockRepository.update).toHaveBeenCalledWith(documentId, {
        status: VerificationStatus.REJECTED,
        rejectionReason: "Document expired",
        notes: "Please submit a valid document",
        reviewedById: reviewerId,
        reviewedAt: expect.any(Date),
      })
      expect(result.status).toBe(VerificationStatus.REJECTED)
    })

    it("should throw error when rejecting without reason", async () => {
      const documentId = "doc-id"
      const reviewerId = "reviewer-id"
      const verifyDto: VerifyDocumentDto = {
        status: VerificationStatus.REJECTED,
        notes: "Please submit a valid document",
      }

      const mockDocument = {
        id: documentId,
        status: VerificationStatus.PENDING,
      }

      jest.spyOn(service, "findOne").mockResolvedValue(mockDocument as any)

      await expect(service.verifyDocument(documentId, verifyDto, reviewerId)).rejects.toThrow(BadRequestException)
    })

    it("should throw error when document is already verified", async () => {
      const documentId = "doc-id"
      const reviewerId = "reviewer-id"
      const verifyDto: VerifyDocumentDto = {
        status: VerificationStatus.APPROVED,
      }

      const mockDocument = {
        id: documentId,
        status: VerificationStatus.APPROVED,
      }

      jest.spyOn(service, "findOne").mockResolvedValue(mockDocument as any)

      await expect(service.verifyDocument(documentId, verifyDto, reviewerId)).rejects.toThrow(BadRequestException)
    })
  })
})
