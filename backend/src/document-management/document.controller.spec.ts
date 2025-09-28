import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentType, DocumentStatus, DocumentPriority } from './entities/document.entity';
import { UploadDocumentDto, QueryDocumentsDto, UpdateDocumentDto } from './dto';
import { CreateVerificationDto } from './dto/verify-document.dto';

describe('DocumentController', () => {
  let controller: DocumentController;
  let service: DocumentService;

  const mockDocument = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    originalName: 'test-document.pdf',
    fileName: 'BILL_OF_LADING_1234567890_abc123_test-document.pdf',
    documentType: DocumentType.BILL_OF_LADING,
    status: DocumentStatus.UPLOADED,
    priority: DocumentPriority.MEDIUM,
    mimeType: 'application/pdf',
    fileSize: 1024000,
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
    tags: ['test', 'shipping'],
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

  const mockRequest = {
    user: { id: 'user-123' },
    get: jest.fn(),
    url: '/documents',
    method: 'GET',
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: {
            uploadDocument: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            downloadDocument: jest.fn(),
            updateDocument: jest.fn(),
            deleteDocument: jest.fn(),
            getDocumentsByShipment: jest.fn(),
            getDocumentStats: jest.fn(),
            createVerification: jest.fn(),
            getDocumentAccessLogs: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadDocument', () => {
    it('should upload a document successfully', async () => {
      const uploadDto: UploadDocumentDto = {
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

      jest.spyOn(service, 'uploadDocument').mockResolvedValue(mockDocument);

      const result = await controller.uploadDocument(mockFile, uploadDto, mockRequest);

      expect(service.uploadDocument).toHaveBeenCalledWith(mockFile, uploadDto, 'user-123', mockRequest);
      expect(result).toBe(mockDocument);
    });
  });

  describe('findAll', () => {
    it('should return documents with pagination', async () => {
      const queryDto: QueryDocumentsDto = {
        limit: 10,
        offset: 0,
        documentType: DocumentType.BILL_OF_LADING,
      };

      const mockResult = {
        documents: [mockDocument],
        total: 1,
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(mockResult);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(service.findAll).toHaveBeenCalledWith(queryDto, 'user-123');
      expect(result).toBe(mockResult);
    });
  });

  describe('getStats', () => {
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

      jest.spyOn(service, 'getDocumentStats').mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(service.getDocumentStats).toHaveBeenCalled();
      expect(result).toBe(mockStats);
    });
  });

  describe('findOne', () => {
    it('should return a document by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockDocument as any);

      const result = await controller.findOne(mockDocument.id, mockRequest);

      expect(service.findOne).toHaveBeenCalledWith(mockDocument.id, 'user-123', mockRequest);
      expect(result).toBe(mockDocument);
    });
  });

  describe('downloadDocument', () => {
    it('should download a document successfully', async () => {
      const mockBuffer = Buffer.from('test content');
      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
      } as any;

      jest.spyOn(service, 'downloadDocument').mockResolvedValue({
        buffer: mockBuffer,
        document: mockDocument,
      });

      await controller.downloadDocument(mockDocument.id, mockResponse, mockRequest);

      expect(service.downloadDocument).toHaveBeenCalledWith(mockDocument.id, 'user-123', mockRequest);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': mockDocument.mimeType,
        'Content-Disposition': `attachment; filename="${mockDocument.originalName}"`,
        'Content-Length': mockBuffer.length.toString(),
      });
      expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
    });
  });

  describe('updateDocument', () => {
    it('should update a document successfully', async () => {
      const updateDto: UpdateDocumentDto = {
        description: 'Updated description',
        priority: DocumentPriority.HIGH,
      };

      const updatedDocument = { ...mockDocument, ...updateDto };

      jest.spyOn(service, 'updateDocument').mockResolvedValue(updatedDocument);

      const result = await controller.updateDocument(mockDocument.id, updateDto, mockRequest);

      expect(service.updateDocument).toHaveBeenCalledWith(
        mockDocument.id,
        updateDto,
        'user-123',
        mockRequest,
      );
      expect(result).toBe(updatedDocument);
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document successfully', async () => {
      jest.spyOn(service, 'deleteDocument').mockResolvedValue();

      await controller.deleteDocument(mockDocument.id, mockRequest);

      expect(service.deleteDocument).toHaveBeenCalledWith(mockDocument.id, 'user-123', mockRequest);
    });
  });

  describe('getDocumentsByShipment', () => {
    it('should return documents for a shipment', async () => {
      jest.spyOn(service, 'getDocumentsByShipment').mockResolvedValue([mockDocument]);

      const result = await controller.getDocumentsByShipment('shipment-123');

      expect(service.getDocumentsByShipment).toHaveBeenCalledWith('shipment-123');
      expect(result).toEqual([mockDocument]);
    });
  });

  describe('createVerification', () => {
    it('should create a verification for a document', async () => {
      const createDto: CreateVerificationDto = {
        verificationType: 'AUTOMATIC' as any,
        verificationNotes: 'Test verification',
      };

      const mockVerification = { id: 'verification-123' };

      jest.spyOn(service, 'createVerification').mockResolvedValue(mockVerification as any);

      const result = await controller.createVerification(mockDocument.id, createDto, mockRequest);

      expect(service.createVerification).toHaveBeenCalledWith(
        mockDocument.id,
        createDto,
        'user-123',
      );
      expect(result).toBe(mockVerification);
    });
  });

  describe('getDocumentAccessLogs', () => {
    it('should return access logs for a document', async () => {
      const mockLogs = [
        {
          id: 'log-123',
          documentId: mockDocument.id,
          action: 'VIEW',
          createdAt: new Date(),
        },
      ];

      jest.spyOn(service, 'getDocumentAccessLogs').mockResolvedValue(mockLogs as any);

      const result = await controller.getDocumentAccessLogs(mockDocument.id, 50);

      expect(service.getDocumentAccessLogs).toHaveBeenCalledWith(mockDocument.id, 50);
      expect(result).toBe(mockLogs);
    });
  });

  describe('searchDocuments', () => {
    it('should search documents by query', async () => {
      const query = 'test';
      const queryDto: QueryDocumentsDto = { limit: 10, offset: 0 };
      const mockResult = {
        documents: [mockDocument],
        total: 1,
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(mockResult);

      const result = await controller.searchDocuments(query, queryDto, mockRequest);

      expect(service.findAll).toHaveBeenCalledWith({ ...queryDto, search: query }, 'user-123');
      expect(result).toBe(mockResult);
    });
  });

  describe('getExpiredDocuments', () => {
    it('should return expired documents', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue({
        documents: [mockDocument],
        total: 1,
      });

      const result = await controller.getExpiredDocuments(mockRequest);

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockDocument]);
    });
  });

  describe('getConfidentialDocuments', () => {
    it('should return confidential documents', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue({
        documents: [mockDocument],
        total: 1,
      });

      const result = await controller.getConfidentialDocuments(mockRequest);

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockDocument]);
    });
  });

  describe('getRequiredDocuments', () => {
    it('should return required documents', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue({
        documents: [mockDocument],
        total: 1,
      });

      const result = await controller.getRequiredDocuments(mockRequest);

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockDocument]);
    });
  });
});
