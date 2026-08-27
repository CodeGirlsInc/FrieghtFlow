import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { DocumentType } from './enums/document-type.enum';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let documentRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
  };
  let shipmentRepo: { findOne: jest.Mock };

  const user = {
    id: 'user-1',
    role: UserRole.SHIPPER,
  } as User;

  const shipment = {
    id: 'shipment-1',
    shipperId: 'user-1',
    carrierId: 'carrier-1',
  } as Shipment;

  beforeEach(async () => {
    documentRepo = {
      create: jest.fn((value) => value),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };
    shipmentRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: getRepositoryToken(Document), useValue: documentRepo },
        { provide: getRepositoryToken(Shipment), useValue: shipmentRepo },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('/uploads') } },
      ],
    }).compile();

    service = module.get(DocumentsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uploads and hashes a document for a shipment party', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('hello'));
    const expectedHash = crypto.createHash('sha256').update('hello').digest('hex');
    documentRepo.save.mockResolvedValue({
      id: 'doc-1',
      shipmentId: shipment.id,
      uploaderId: user.id,
      documentType: DocumentType.INVOICE,
      originalName: 'invoice.pdf',
      storedName: 'stored.pdf',
      mimetype: 'application/pdf',
      sizeBytes: 5,
      sha256Hash: expectedHash,
      ipfsCid: null,
      onChainDocumentId: null,
      notes: null,
    });

    const result = await service.upload(
      {
        path: '/tmp/file.pdf',
        originalname: 'invoice.pdf',
        filename: 'stored.pdf',
        mimetype: 'application/pdf',
        size: 5,
      } as Express.Multer.File,
      { shipmentId: shipment.id, documentType: DocumentType.INVOICE },
      user,
    );

    expect(documentRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        shipmentId: shipment.id,
        uploaderId: user.id,
        sha256Hash: expectedHash,
      }),
    );
    expect(result.sha256Hash).toBe(expectedHash);
  });

  it('forbids non-parties from accessing a document', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    documentRepo.findOne.mockResolvedValue({
      id: 'doc-1',
      shipmentId: shipment.id,
      uploaderId: 'carrier-1',
      originalName: 'invoice.pdf',
      storedName: 'stored.pdf',
    });

    await expect(
      service.findOne('doc-1', { id: 'user-2', role: UserRole.SHIPPER } as never),
    ).rejects.toThrow(ForbiddenException);
  });

  it('returns a file path when the file exists', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    documentRepo.findOne.mockResolvedValue({
      id: 'doc-1',
      shipmentId: shipment.id,
      uploaderId: user.id,
      originalName: 'invoice.pdf',
      storedName: 'stored.pdf',
    });
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    await expect(service.getFilePath('doc-1', user)).resolves.toEqual({
      filePath: '/uploads/stored.pdf',
      originalName: 'invoice.pdf',
    });
  });

  it('removes the document and underlying file for the uploader', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    documentRepo.findOne.mockResolvedValue({
      id: 'doc-1',
      shipmentId: shipment.id,
      uploaderId: user.id,
      originalName: 'invoice.pdf',
      storedName: 'stored.pdf',
    });
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => undefined);
    documentRepo.remove.mockResolvedValue(undefined);

    await service.delete('doc-1', user);

    expect(unlinkSpy).toHaveBeenCalledWith('/uploads/stored.pdf');
    expect(documentRepo.remove).toHaveBeenCalled();
  });

  it('throws when the file is missing', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    documentRepo.findOne.mockResolvedValue({
      id: 'doc-1',
      shipmentId: shipment.id,
      uploaderId: user.id,
      originalName: 'invoice.pdf',
      storedName: 'stored.pdf',
    });
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    await expect(service.getFilePath('doc-1', user)).rejects.toThrow(
      NotFoundException,
    );
  });
});
