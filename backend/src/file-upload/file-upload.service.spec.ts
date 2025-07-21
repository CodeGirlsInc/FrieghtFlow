import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { FileUploadService } from "./file-upload.service"
import { ShippingDocument, DocumentType, DocumentStatus } from "./entities/document.entity"
import { FileStorageService } from "./services/file-storage.service"
import { FileValidationService } from "./services/file-validation.service"
import { jest } from "@jest/globals"
import type { Express } from "express"

describe("FileUploadService", () => {
  let service: FileUploadService
  let repository: Repository<ShippingDocument>
  let fileStorageService: FileStorageService
  let fileValidationService: FileValidationService

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockFileStorageService = {
    storeFile: jest.fn(),
    deleteFile: jest.fn(),
    getFileStream: jest.fn(),
  }

  const mockFileValidationService = {
    validateUploadRequest: jest.fn(),
    validateFile: jest.fn(),
  }

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    select: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        {
          provide: getRepositoryToken(ShippingDocument),
          useValue: mockRepository,
        },
        {
          provide: FileStorageService,
          useValue: mockFileStorageService,
        },
        {
          provide: FileValidationService,
          useValue: mockFileValidationService,
        },
      ],
    }).compile()

    service = module.get<FileUploadService>(FileUploadService)
    repository = module.get<Repository<ShippingDocument>>(getRepositoryToken(ShippingDocument))
    fileStorageService = module.get<FileStorageService>(FileStorageService)
    fileValidationService = module.get<FileValidationService>(FileValidationService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("uploadDocument", () => {
    const mockFile = {
      originalname: "test.pdf",
      mimetype: "application/pdf",
      size: 1024,
      buffer: Buffer.from("test"),
    } as Express.Multer.File

    const uploadDto = {
      documentType: DocumentType.BILL_OF_LADING,
      shipmentId: "shipment-123",
      description: "Test document",
    }

    it("should successfully upload a document", async () => {
      const mockStorageResult = {
        filePath: "/uploads/test.pdf",
        fileName: "test_123.pdf",
        checksum: "abc123",
      }

      const mockDocument = {
        id: "doc-123",
        originalName: mockFile.originalname,
        fileName: mockStorageResult.fileName,
        filePath: mockStorageResult.filePath,
        status: DocumentStatus.UPLOADED,
      }

      mockFileValidationService.validateUploadRequest.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
      })

      mockFileValidationService.validateFile.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
      })

      mockFileStorageService.storeFile.mockResolvedValue(mockStorageResult)
      mockRepository.create.mockReturnValue(mockDocument)
      mockRepository.save.mockResolvedValue(mockDocument)

      const result = await service.uploadDocument(mockFile, uploadDto, "user-123")

      expect(fileValidationService.validateUploadRequest).toHaveBeenCalledWith(uploadDto, uploadDto.documentType)
      expect(fileValidationService.validateFile).toHaveBeenCalledWith(mockFile, uploadDto.documentType)
      expect(fileStorageService.storeFile).toHaveBeenCalledWith(mockFile, uploadDto.documentType, "user-123")
      expect(repository.create).toHaveBeenCalled()
      expect(repository.save).toHaveBeenCalled()
      expect(result).toEqual(mockDocument)
    })

    it("should throw BadRequestException for invalid upload request", async () => {
      mockFileValidationService.validateUploadRequest.mockReturnValue({
        isValid: false,
        errors: ["Missing required field"],
        warnings: [],
      })

      await expect(service.uploadDocument(mockFile, uploadDto)).rejects.toThrow(BadRequestException)
      expect(fileStorageService.storeFile).not.toHaveBeenCalled()
    })

    it("should throw BadRequestException for invalid file", async () => {
      mockFileValidationService.validateUploadRequest.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
      })

      mockFileValidationService.validateFile.mockReturnValue({
        isValid: false,
        errors: ["File too large"],
        warnings: [],
      })

      await expect(service.uploadDocument(mockFile, uploadDto)).rejects.toThrow(BadRequestException)
      expect(fileStorageService.storeFile).not.toHaveBeenCalled()
    })
  })

  describe("findOne", () => {
    it("should return a document by ID", async () => {
      const mockDocument = { id: "doc-123", originalName: "test.pdf" }
      mockRepository.findOne.mockResolvedValue(mockDocument)

      const result = await service.findOne("doc-123")

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: "doc-123" } })
      expect(result).toEqual(mockDocument)
    })

    it("should throw NotFoundException when document not found", async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne("doc-123")).rejects.toThrow(NotFoundException)
    })
  })

  describe("downloadDocument", () => {
    it("should return document buffer and metadata", async () => {
      const mockDocument = {
        id: "doc-123",
        filePath: "/uploads/test.pdf",
        s3Key: "test-key",
      }
      const mockBuffer = Buffer.from("test content")

      mockRepository.findOne.mockResolvedValue(mockDocument)
      mockFileStorageService.getFileStream.mockResolvedValue(mockBuffer)

      const result = await service.downloadDocument("doc-123")

      expect(fileStorageService.getFileStream).toHaveBeenCalledWith(mockDocument.filePath, mockDocument.s3Key)
      expect(result).toEqual({ buffer: mockBuffer, document: mockDocument })
    })
  })

  describe("deleteDocument", () => {
    it("should delete document and file", async () => {
      const mockDocument = {
        id: "doc-123",
        filePath: "/uploads/test.pdf",
        s3Key: "test-key",
      }

      mockRepository.findOne.mockResolvedValue(mockDocument)
      mockFileStorageService.deleteFile.mockResolvedValue(undefined)
      mockRepository.remove.mockResolvedValue(mockDocument)

      await service.deleteDocument("doc-123")

      expect(fileStorageService.deleteFile).toHaveBeenCalledWith(mockDocument.filePath, mockDocument.s3Key)
      expect(repository.remove).toHaveBeenCalledWith(mockDocument)
    })
  })

  describe("findAll", () => {
    it("should return paginated documents with filters", async () => {
      const queryDto = {
        documentType: DocumentType.BILL_OF_LADING,
        limit: 10,
        offset: 0,
      }

      const mockDocuments = [{ id: "doc-1" }, { id: "doc-2" }]

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockDocuments, 2])

      const result = await service.findAll(queryDto)

      expect(repository.createQueryBuilder).toHaveBeenCalledWith("document")
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("document.documentType = :documentType", {
        documentType: DocumentType.BILL_OF_LADING,
      })
      expect(result).toEqual({ documents: mockDocuments, total: 2 })
    })
  })
})
