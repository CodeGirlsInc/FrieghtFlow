import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { DocumentIntegrityService } from './document-integrity.service';
import { Document } from '../../documents/entities/document.entity';

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('DocumentIntegrityService', () => {
  let service: DocumentIntegrityService;
  let mockRepo: { findOne: jest.Mock };

  const fakeDoc = {
    id: 'doc-1',
    storedName: '/storage/docs/file.pdf',
    sha256Hash: 'abc123',
  } as Document;

  beforeEach(async () => {
    mockRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentIntegrityService,
        { provide: getRepositoryToken(Document), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<DocumentIntegrityService>(DocumentIntegrityService);
  });

  it('returns valid=true when hashes match', async () => {
    const content = Buffer.from('file content');
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    const doc = { ...fakeDoc, sha256Hash: hash } as Document;

    mockRepo.findOne.mockResolvedValue(doc);
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(content);

    const result = await service.verifyIntegrity('doc-1');

    expect(result.valid).toBe(true);
    expect(result.storedHash).toBe(hash);
    expect(result.computedHash).toBe(hash);
  });

  it('returns valid=false when hashes do not match', async () => {
    mockRepo.findOne.mockResolvedValue(fakeDoc);
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(Buffer.from('tampered content'));

    const result = await service.verifyIntegrity('doc-1');

    expect(result.valid).toBe(false);
    expect(result.storedHash).toBe('abc123');
    expect(result.computedHash).not.toBe('abc123');
  });

  it('throws NotFoundException when document record does not exist', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(service.verifyIntegrity('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws NotFoundException when file does not exist on disk', async () => {
    mockRepo.findOne.mockResolvedValue(fakeDoc);
    mockFs.existsSync.mockReturnValue(false);

    await expect(service.verifyIntegrity('doc-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
