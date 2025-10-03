import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentValidationService } from './document-validation.service';
import { CustomsDocument, DocumentType, DocumentStatus } from '../entities/customs-document.entity';
import { CustomsRequirement, RequirementType } from '../entities/customs-requirement.entity';

describe('DocumentValidationService (unit)', () => {
  let service: DocumentValidationService;
  let documentRepo: any;
  let requirementRepo: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [CustomsDocument, CustomsRequirement],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([CustomsDocument, CustomsRequirement]),
      ],
      providers: [DocumentValidationService],
    }).compile();

    service = module.get<DocumentValidationService>(DocumentValidationService);
    documentRepo = module.get('CustomsDocumentRepository');
    requirementRepo = module.get('CustomsRequirementRepository');
  });

  beforeEach(async () => {
    // Clear database before each test
    await documentRepo.clear();
    await requirementRepo.clear();
  });

  describe('validateDocument', () => {
    it('should validate a commercial invoice successfully', async () => {
      const document = await documentRepo.save({
        shipmentId: 'shipment-123',
        documentType: DocumentType.COMMERCIAL_INVOICE,
        fileName: 'invoice.pdf',
        fileUrl: '/uploads/invoice.pdf',
        mimeType: 'application/pdf',
        fileSize: '1MB',
        metadata: JSON.stringify({
          invoice_number: 'INV-001',
          date: '2024-01-01',
          seller: 'Test Company',
          buyer: 'Buyer Company',
          goods_description: 'Test goods',
          value: '1000.00',
        }),
      });

      const result = await service.validateDocument(document.id);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata.invoiceData).toBeDefined();
    });

    it('should reject document with missing required fields', async () => {
      const document = await documentRepo.save({
        shipmentId: 'shipment-123',
        documentType: DocumentType.COMMERCIAL_INVOICE,
        fileName: 'invoice.pdf',
        fileUrl: '/uploads/invoice.pdf',
        mimeType: 'application/pdf',
        fileSize: '1MB',
        metadata: JSON.stringify({
          invoice_number: 'INV-001',
          // Missing required fields
        }),
      });

      const result = await service.validateDocument(document.id);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should validate file format and size', async () => {
      const document = await documentRepo.save({
        shipmentId: 'shipment-123',
        documentType: DocumentType.PACKING_LIST,
        fileName: 'packing_list.pdf',
        fileUrl: '/uploads/packing_list.pdf',
        mimeType: 'application/pdf',
        fileSize: '15MB', // Exceeds 10MB limit
      });

      const result = await service.validateDocument(document.id);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('exceeds maximum allowed size'))).toBe(true);
    });

    it('should check document expiry date', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1); // Yesterday

      const document = await documentRepo.save({
        shipmentId: 'shipment-123',
        documentType: DocumentType.CERTIFICATE_OF_ORIGIN,
        fileName: 'certificate.pdf',
        fileUrl: '/uploads/certificate.pdf',
        mimeType: 'application/pdf',
        fileSize: '1MB',
        expiryDate: expiredDate,
      });

      const result = await service.validateDocument(document.id);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('expired'))).toBe(true);
    });

    it('should validate against custom requirements', async () => {
      const requirement = await requirementRepo.save({
        requirementCode: 'REQ-001',
        name: 'PDF Only Requirement',
        type: RequirementType.DOCUMENT,
        originCountry: 'US',
        destinationCountry: 'CA',
        documentFormat: 'PDF',
        validationRules: JSON.stringify({
          maxFileSize: 5 * 1024 * 1024, // 5MB
          allowedMimeTypes: ['application/pdf'],
        }),
      });

      const document = await documentRepo.save({
        shipmentId: 'shipment-123',
        documentType: DocumentType.COMMERCIAL_INVOICE,
        fileName: 'invoice.pdf',
        fileUrl: '/uploads/invoice.pdf',
        mimeType: 'application/pdf',
        fileSize: '1MB',
        requirementId: requirement.id,
      });

      const result = await service.validateDocument(document.id);

      expect(result.isValid).toBe(true);
    });

    it('should reject document that violates requirements', async () => {
      const requirement = await requirementRepo.save({
        requirementCode: 'REQ-002',
        name: 'PDF Only Requirement',
        type: RequirementType.DOCUMENT,
        originCountry: 'US',
        destinationCountry: 'CA',
        documentFormat: 'PDF',
        validationRules: JSON.stringify({
          maxFileSize: 5 * 1024 * 1024, // 5MB
          allowedMimeTypes: ['application/pdf'],
        }),
      });

      const document = await documentRepo.save({
        shipmentId: 'shipment-123',
        documentType: DocumentType.COMMERCIAL_INVOICE,
        fileName: 'invoice.doc',
        fileUrl: '/uploads/invoice.doc',
        mimeType: 'application/msword', // Wrong MIME type
        fileSize: '1MB',
        requirementId: requirement.id,
      });

      const result = await service.validateDocument(document.id);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('not allowed'))).toBe(true);
    });
  });

  describe('validateDocuments (batch)', () => {
    it('should validate multiple documents', async () => {
      const doc1 = await documentRepo.save({
        shipmentId: 'shipment-123',
        documentType: DocumentType.COMMERCIAL_INVOICE,
        fileName: 'invoice.pdf',
        fileUrl: '/uploads/invoice.pdf',
        mimeType: 'application/pdf',
        fileSize: '1MB',
      });

      const doc2 = await documentRepo.save({
        shipmentId: 'shipment-123',
        documentType: DocumentType.PACKING_LIST,
        fileName: 'packing.pdf',
        fileUrl: '/uploads/packing.pdf',
        mimeType: 'application/pdf',
        fileSize: '1MB',
      });

      const results = await service.validateDocuments([doc1.id, doc2.id]);

      expect(results).toHaveProperty(doc1.id);
      expect(results).toHaveProperty(doc2.id);
      expect(results[doc1.id]).toHaveProperty('isValid');
      expect(results[doc2.id]).toHaveProperty('isValid');
    });
  });
});
