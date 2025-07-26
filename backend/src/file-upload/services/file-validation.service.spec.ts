import { Test, type TestingModule } from '@nestjs/testing';
import { FileValidationService } from './file-validation.service';
import { DocumentType } from '../entities/document.entity';
import type { Express } from 'express';

describe('FileValidationService', () => {
  let service: FileValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileValidationService],
    }).compile();

    service = module.get<FileValidationService>(FileValidationService);
  });

  describe('validateFile', () => {
    const createMockFile = (
      overrides: Partial<Express.Multer.File> = {},
    ): Express.Multer.File => ({
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test'),
      fieldname: 'file',
      encoding: '7bit',
      destination: '',
      filename: '',
      path: '',
      stream: null,
      ...overrides,
    });

    it('should validate a valid PDF file', () => {
      const file = createMockFile();
      const result = service.validateFile(file, DocumentType.BILL_OF_LADING);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject file that is too large', () => {
      const file = createMockFile({ size: 50 * 1024 * 1024 }); // 50MB
      const result = service.validateFile(file, DocumentType.BILL_OF_LADING);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('exceeds maximum allowed size'),
      );
    });

    it('should reject empty file', () => {
      const file = createMockFile({ size: 0 });
      const result = service.validateFile(file, DocumentType.BILL_OF_LADING);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File is empty');
    });

    it('should reject invalid MIME type', () => {
      const file = createMockFile({ mimetype: 'text/plain' });
      const result = service.validateFile(file, DocumentType.BILL_OF_LADING);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('File type text/plain is not allowed'),
      );
    });

    it('should reject invalid file extension', () => {
      const file = createMockFile({ originalname: 'test.txt' });
      const result = service.validateFile(file, DocumentType.BILL_OF_LADING);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('File extension .txt is not allowed'),
      );
    });

    it('should provide warnings for potentially corrupted files', () => {
      const file = createMockFile({
        mimetype: 'application/pdf',
        buffer: Buffer.from('not a pdf'),
      });
      const result = service.validateFile(file, DocumentType.BILL_OF_LADING);

      expect(result.warnings).toContain(
        expect.stringContaining('may be corrupted'),
      );
    });
  });

  describe('validateUploadRequest', () => {
    it('should validate request with required fields', () => {
      const dto = {
        documentType: DocumentType.BILL_OF_LADING,
        shipmentId: 'shipment-123',
      };

      const result = service.validateUploadRequest(
        dto,
        DocumentType.BILL_OF_LADING,
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject request missing required fields', () => {
      const dto = {
        documentType: DocumentType.BILL_OF_LADING,
        // Missing shipmentId which is required for BILL_OF_LADING
      };

      const result = service.validateUploadRequest(
        dto,
        DocumentType.BILL_OF_LADING,
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Required field missing: shipmentId');
    });
  });
});
