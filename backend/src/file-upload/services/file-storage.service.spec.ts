import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FileStorageService } from './file-storage.service';
import * as fs from 'fs/promises';
import type { Express } from 'express';
import { jest } from '@jest/globals';

jest.mock('fs/promises');

describe('FileStorageService', () => {
  let service: FileStorageService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
    mockConfigService.get.mockImplementation(
      (key: string, defaultValue?: any) => {
        const config = {
          USE_S3_STORAGE: false,
        };
        return config[key] ?? defaultValue;
      },
    );
  });

  describe('storeFile', () => {
    const mockFile = {
      originalname: 'test.pdf',
      buffer: Buffer.from('test content'),
    } as Express.Multer.File;

    it('should store file locally when S3 is disabled', async () => {
      const mockMkdir = jest.mocked(fs.mkdir);
      const mockWriteFile = jest.mocked(fs.writeFile);

      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await service.storeFile(
        mockFile,
        'BILL_OF_LADING',
        'user-123',
      );

      expect(mockMkdir).toHaveBeenCalled();
      expect(mockWriteFile).toHaveBeenCalled();
      expect(result.fileName).toContain('BILL_OF_LADING');
      expect(result.filePath).toContain(result.fileName);
      expect(result.checksum).toBeDefined();
    });

    it('should handle storage errors', async () => {
      const mockMkdir = jest.mocked(fs.mkdir);
      mockMkdir.mockRejectedValue(new Error('Permission denied'));

      await expect(
        service.storeFile(mockFile, 'BILL_OF_LADING'),
      ).rejects.toThrow('File storage failed');
    });
  });

  describe('deleteFile', () => {
    it('should delete local file', async () => {
      const mockUnlink = jest.mocked(fs.unlink);
      mockUnlink.mockResolvedValue(undefined);

      await service.deleteFile('/path/to/file.pdf');

      expect(mockUnlink).toHaveBeenCalledWith('/path/to/file.pdf');
    });

    it('should handle deletion errors gracefully', async () => {
      const mockUnlink = jest.mocked(fs.unlink);
      mockUnlink.mockRejectedValue(new Error('File not found'));

      // Should not throw error
      await expect(
        service.deleteFile('/path/to/file.pdf'),
      ).resolves.toBeUndefined();
    });
  });

  describe('getFileStream', () => {
    it('should read file from local storage', async () => {
      const mockReadFile = jest.mocked(fs.readFile);
      const mockBuffer = Buffer.from('file content');
      mockReadFile.mockResolvedValue(mockBuffer);

      const result = await service.getFileStream('/path/to/file.pdf');

      expect(mockReadFile).toHaveBeenCalledWith('/path/to/file.pdf');
      expect(result).toEqual(mockBuffer);
    });

    it('should handle read errors', async () => {
      const mockReadFile = jest.mocked(fs.readFile);
      mockReadFile.mockRejectedValue(new Error('File not found'));

      await expect(service.getFileStream('/path/to/file.pdf')).rejects.toThrow(
        'File retrieval failed',
      );
    });
  });
});
