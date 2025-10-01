import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { DocumentStorageService } from './document-storage.service';
import { DocumentType } from '../entities/document.entity';

describe('DocumentStorageService', () => {
  let service: DocumentStorageService;
  let configService: ConfigService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentStorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                MAX_FILE_SIZE: 50 * 1024 * 1024,
                ALLOWED_MIME_TYPES: [
                  'application/pdf',
                  'image/jpeg',
                  'image/png',
                  'image/tiff',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.ms-excel',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ],
                LOCAL_UPLOAD_DIR: './uploads/documents',
                S3_BUCKET: 'test-bucket',
                S3_PREFIX: 'documents/',
                USE_S3_STORAGE: false,
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentStorageService>(DocumentStorageService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('storeFile', () => {
    it('should store a file locally when S3 is disabled', async () => {
      const result = await service.storeFile(mockFile, DocumentType.BILL_OF_LADING, 'user-123');

      expect(result).toHaveProperty('filePath');
      expect(result).toHaveProperty('fileName');
      expect(result).toHaveProperty('checksum');
      expect(result.fileName).toContain('BILL_OF_LADING');
      expect(result.fileName).toContain('user-123');
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const invalidFile = { ...mockFile, mimetype: 'application/unknown' };

      await expect(
        service.storeFile(invalidFile, DocumentType.BILL_OF_LADING, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for file too large', async () => {
      const largeFile = { ...mockFile, size: 100 * 1024 * 1024 }; // 100MB

      await expect(
        service.storeFile(largeFile, DocumentType.BILL_OF_LADING, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no file provided', async () => {
      await expect(
        service.storeFile(null, DocumentType.BILL_OF_LADING, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getFileStream', () => {
    it('should retrieve file stream successfully', async () => {
      const filePath = '/uploads/documents/test-file.pdf';
      const mockBuffer = Buffer.from('test content');

      // Mock the file system read
      jest.spyOn(require('fs/promises'), 'readFile').mockResolvedValue(mockBuffer);

      const result = await service.getFileStream(filePath);

      expect(result).toBe(mockBuffer);
    });

    it('should throw BadRequestException when file not found', async () => {
      const filePath = '/uploads/documents/non-existent.pdf';

      jest.spyOn(require('fs/promises'), 'readFile').mockRejectedValue(new Error('File not found'));

      await expect(service.getFileStream(filePath)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const filePath = '/uploads/documents/test-file.pdf';

      jest.spyOn(require('fs/promises'), 'unlink').mockResolvedValue(undefined);

      await expect(service.deleteFile(filePath)).resolves.not.toThrow();
    });

    it('should handle file deletion errors gracefully', async () => {
      const filePath = '/uploads/documents/test-file.pdf';

      jest.spyOn(require('fs/promises'), 'unlink').mockRejectedValue(new Error('Permission denied'));

      // Should not throw error for local file deletion failures
      await expect(service.deleteFile(filePath)).resolves.not.toThrow();
    });
  });

  describe('getFileInfo', () => {
    it('should get file information successfully', async () => {
      const filePath = '/uploads/documents/test-file.pdf';
      const mockStats = {
        size: 1024000,
        mtime: new Date('2024-01-15T10:30:00Z'),
      };

      jest.spyOn(require('fs/promises'), 'stat').mockResolvedValue(mockStats);

      const result = await service.getFileInfo(filePath);

      expect(result).toEqual({
        size: mockStats.size,
        lastModified: mockStats.mtime,
      });
    });

    it('should throw BadRequestException when file info cannot be retrieved', async () => {
      const filePath = '/uploads/documents/non-existent.pdf';

      jest.spyOn(require('fs/promises'), 'stat').mockRejectedValue(new Error('File not found'));

      await expect(service.getFileInfo(filePath)).rejects.toThrow(BadRequestException);
    });
  });
});
