import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentStorageService } from './services/document-storage.service';
import { DocumentVerificationService } from './services/document-verification.service';
import { DocumentAccessLogService } from './services/document-access-log.service';
import { Document, DocumentStatus, DocumentType, DocumentPriority } from './entities/document.entity';
import { DocumentVerification } from './entities/document-verification.entity';
import { DocumentAccessLog } from './entities/document-access-log.entity';
import { UploadDocumentDto, QueryDocumentsDto, UpdateDocumentDto } from './dto';
import { CreateVerificationDto } from './dto/verify-document.dto';

describe('DocumentService', () => {
  let service: DocumentService;
  let documentRepository: Repository<Document>;
  let verificationRepository: Repository<DocumentVerification>;
  let accessLogRepository: Repository<DocumentAccessLog>;
  let storageService: DocumentStorageService;
  let verificationService: DocumentVerificationService;
  let accessLogService: DocumentAccessLogService;

  const mockDocument: Document = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    originalName: 'test-document.pdf',
    fileName: 'BILL_OF_LADING_1234567890_abc123_test-document.pdf',
    filePath: '/uploads/documents/BILL_OF_LADING_1234567890_abc123_test-document.pdf',
    mimeType: 'application/pdf',
    fileSize: 1024000,
    documentType: DocumentType.BILL_OF_LADING,
    status: DocumentStatus.UPLOADED,
    priority: DocumentPriority.MEDIUM,
    shipmentId: 'shipment-123',
    uploadedBy: 'user-123',
    description: 'Test document',
    metadata: {},
    checksum: 'abc123def456',
    version: '1.0',
    parentDocumentId: null,
    expiryDate: null,
    rejectionReason: null,
    validatedBy: null,
    validatedAt: null,
    tags: 'test,shipping',
    isConfidential: false,
    isRequired: true,
    countryOfOrigin: 'US',
    countryOfDestination: 'CA',
    customsCode: 'HS1234567890',
    weight: 150.5,
    value: 5000.00,
    currency: 'USD',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    uploader: null,
    parentDocument: null,
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-document.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024000,
    buffer: Buffer.from('test file content'),
    stream: null,
    destination: null,
    filename: null,
    path: null,
  };

  const mockUploadDto: UploadDocumentDto = {
    documentType: DocumentType.BILL_OF_LADING,
    shipmentId: 'shipment-123',
    description: 'Test document',
    priority: DocumentPriority.MEDIUM,
    isConfidential: false,
    isRequired: true,
    countryOfOrigin: 'US',
    countryOfDestination: 'CA',
    customsCode: 'HS1234567890',
    weight: 150.5,
    value: 5000.00,
    currency: 'USD',
    tags: ['test', 'shipping'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getRepositoryToken(Document),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DocumentVerification),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DocumentAccessLog),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: DocumentStorageService,
          useValue: {
            storeFile: jest.fn(),
            getFileStream: jest.fn(),
            deleteFile: jest.fn(),
            getFileInfo: jest.fn(),
          },
        },
        {
          provide: DocumentVerificationService,
          useValue: {
            createVerification: jest.fn(),
            getDocumentVerifications: jest.fn(),
            getVerificationStats: jest.fn(),
          },
        },
        {
          provide: DocumentAccessLogService,
          useValue: {
            logAccess: jest.fn(),
            getDocumentAccessLogs: jest.fn(),
            getUserAccessLogs: jest.fn(),
            getAccessStats: jest.fn(),
            getRecentAccess: jest.fn(),
            getSuspiciousActivity: jest.fn(),
            cleanupOldLogs: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    documentRepository = module.get<Repository<Document>>(getRepositoryToken(Document));
    verificationRepository = module.get<Repository<DocumentVerification>>(getRepositoryToken(DocumentVerification));
    accessLogRepository = module.get<Repository<DocumentAccessLog>>(getRepositoryToken(DocumentAccessLog));
    storageService = module.get<DocumentStorageService>(DocumentStorageService);
    verificationService = module.get<DocumentVerificationService>(DocumentVerificationService);
    accessLogService = module.get<DocumentAccessLogService>(DocumentAccessLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadDocument', () => {
    it('should upload a document successfully', async () => {
      const storageResult = {
        filePath: '/uploads/documents/test-file.pdf',
        fileName: 'test-file.pdf',
        checksum: 'abc123',
        s3Key: 'documents/test-file.pdf',
        s3Bucket: 'test-bucket',
      };

      jest.spyOn(storageService, 'storeFile').mockResolvedValue(storageResult);
      jest.spyOn(documentRepository, 'create').mockReturnValue(mockDocument);
      jest.spyOn(documentRepository, 'save').mockResolvedValue(mockDocument);
      jest.spyOn(accessLogService, 'logAccess').mockResolvedValue({} as DocumentAccessLog);

      const result = await service.uploadDocument(mockFile, mockUploadDto, 'user-123');

      expect(storageService.storeFile).toHaveBeenCalledWith(mockFile, DocumentType.BILL_OF_LADING, 'user-123');
      expect(documentRepository.create).toHaveBeenCalled();
      expect(documentRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when storage fails', async () => {
      jest.spyOn(storageService, 'storeFile').mockRejectedValue(new Error('Storage failed'));

      await expect(service.uploadDocument(mockFile, mockUploadDto, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return documents with pagination', async () => {
      const queryDto: QueryDocumentsDto = {
        limit: 10,
        offset: 0,
        documentType: DocumentType.BILL_OF_LADING,
      };

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockDocument], 1]),
      };

      jest.spyOn(documentRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(queryDto, 'user-123');

      expect(result.documents).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'document.documentType = :documentType',
        { documentType: DocumentType.BILL_OF_LADING },
      );
    });
  });

  describe('findOne', () => {
    it('should return a document by id', async () => {
      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(mockDocument);
      jest.spyOn(verificationService, 'getDocumentVerifications').mockResolvedValue([]);
      jest.spyOn(accessLogService, 'logAccess').mockResolvedValue({} as DocumentAccessLog);

      const result = await service.findOne(mockDocument.id, 'user-123');

      expect(result.id).toBe(mockDocument.id);
      expect(documentRepository.findOne).toHaveBeenCalledWith({ where: { id: mockDocument.id } });
    });

    it('should throw NotFoundException when document not found', async () => {
      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('non-existent-id', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for confidential document', async () => {
      const confidentialDocument = { ...mockDocument, isConfidential: true, uploadedBy: 'other-user' };
      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(confidentialDocument);

      await expect(service.findOne(mockDocument.id, 'user-123')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('downloadDocument', () => {
    it('should download a document successfully', async () => {
      const mockBuffer = Buffer.from('test content');
      
      jest.spyOn(service, 'findOne').mockResolvedValue(mockDocument as any);
      jest.spyOn(storageService, 'getFileStream').mockResolvedValue(mockBuffer);
      jest.spyOn(accessLogService, 'logAccess').mockResolvedValue({} as DocumentAccessLog);

      const result = await service.downloadDocument(mockDocument.id, 'user-123');

      expect(result.buffer).toBe(mockBuffer);
      expect(result.document.id).toBe(mockDocument.id);
      expect(storageService.getFileStream).toHaveBeenCalledWith(
        mockDocument.filePath,
        mockDocument.s3Key,
      );
    });
  });

  describe('updateDocument', () => {
    it('should update a document successfully', async () => {
      const updateDto: UpdateDocumentDto = {
        description: 'Updated description',
        priority: DocumentPriority.HIGH,
      };

      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(mockDocument);
      jest.spyOn(documentRepository, 'save').mockResolvedValue({ ...mockDocument, ...updateDto });
      jest.spyOn(accessLogService, 'logAccess').mockResolvedValue({} as DocumentAccessLog);

      const result = await service.updateDocument(mockDocument.id, updateDto, 'user-123');

      expect(result.description).toBe(updateDto.description);
      expect(result.priority).toBe(updateDto.priority);
    });

    it('should throw ForbiddenException when user is not the uploader', async () => {
      const otherUserDocument = { ...mockDocument, uploadedBy: 'other-user' };
      jest.spyOn(documentRepository, 'findOne').mockResolvedValue(otherUserDocument);

      await expect(
        service.updateDocument(mockDocument.id, { description: 'test' }, 'user-123'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockDocument as any);
      jest.spyOn(storageService, 'deleteFile').mockResolvedValue();
      jest.spyOn(documentRepository, 'remove').mockResolvedValue(mockDocument);
      jest.spyOn(accessLogService, 'logAccess').mockResolvedValue({} as DocumentAccessLog);

      await service.deleteDocument(mockDocument.id, 'user-123');

      expect(storageService.deleteFile).toHaveBeenCalledWith(mockDocument.filePath, mockDocument.s3Key);
      expect(documentRepository.remove).toHaveBeenCalledWith(mockDocument);
    });

    it('should throw ForbiddenException when user is not the uploader', async () => {
      const otherUserDocument = { ...mockDocument, uploadedBy: 'other-user' };
      jest.spyOn(service, 'findOne').mockResolvedValue(otherUserDocument as any);

      await expect(service.deleteDocument(mockDocument.id, 'user-123')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getDocumentsByShipment', () => {
    it('should return documents for a shipment', async () => {
      jest.spyOn(documentRepository, 'find').mockResolvedValue([mockDocument]);

      const result = await service.getDocumentsByShipment('shipment-123');

      expect(result).toHaveLength(1);
      expect(documentRepository.find).toHaveBeenCalledWith({
        where: { shipmentId: 'shipment-123' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getDocumentStats', () => {
    it('should return document statistics', async () => {
      const mockStats = {
        totalDocuments: 100,
        totalSize: 1024000000,
        byType: { [DocumentType.BILL_OF_LADING]: 50 },
        byStatus: { [DocumentStatus.UPLOADED]: 80 },
        byPriority: { [DocumentPriority.MEDIUM]: 60 },
        confidentialCount: 10,
        requiredCount: 40,
        expiredCount: 5,
      };

      jest.spyOn(documentRepository, 'count').mockResolvedValue(100);
      jest.spyOn(documentRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        getRawOne: jest.fn().mockResolvedValue({ totalSize: '1024000000' }),
      } as any);

      const result = await service.getDocumentStats();

      expect(result.totalDocuments).toBe(100);
    });
  });

  describe('createVerification', () => {
    it('should create a verification for a document', async () => {
      const createDto: CreateVerificationDto = {
        verificationType: 'AUTOMATIC' as any,
        verificationNotes: 'Test verification',
      };

      const mockVerification = { id: 'verification-123' } as DocumentVerification;
      jest.spyOn(verificationService, 'createVerification').mockResolvedValue(mockVerification);

      const result = await service.createVerification(mockDocument.id, createDto, 'user-123');

      expect(result).toBe(mockVerification);
      expect(verificationService.createVerification).toHaveBeenCalledWith(
        mockDocument.id,
        createDto,
        'user-123',
      );
    });
  });
});
