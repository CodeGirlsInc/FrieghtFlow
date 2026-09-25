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

type RenameSpy = jest.SpyInstance<void, [fs.PathLike, fs.PathLike]>;

function mockFileRename(): RenameSpy {
  return jest
    .spyOn(fs, 'renameSync')
    .mockImplementation(() => undefined) as RenameSpy;
}

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
      create: jest.fn((value: unknown) => value),
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
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('/uploads') },
        },
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
    const expectedHash = crypto
      .createHash('sha256')
      .update('hello')
      .digest('hex');
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

  it('removes the Multer-written file when document persistence fails', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('hello'));
    const persistenceError = new Error('database unavailable');
    documentRepo.save.mockRejectedValue(persistenceError);
    const unlinkSpy = jest
      .spyOn(fs, 'unlinkSync')
      .mockImplementation(() => undefined);

    await expect(
      service.upload(
        {
          path: '/tmp/file.pdf',
          originalname: 'invoice.pdf',
          filename: 'stored.pdf',
          mimetype: 'application/pdf',
          size: 5,
        } as Express.Multer.File,
        { shipmentId: shipment.id, documentType: DocumentType.INVOICE },
        user,
      ),
    ).rejects.toBe(persistenceError);

    expect(unlinkSpy).toHaveBeenCalledWith('/tmp/file.pdf');
  });

  it('removes the input when upload authorization fails', async () => {
    shipmentRepo.findOne.mockResolvedValue({
      ...shipment,
      shipperId: 'another-user',
    });
    const unlinkSpy = jest
      .spyOn(fs, 'unlinkSync')
      .mockImplementation(() => undefined);

    await expect(
      service.upload(
        {
          path: '/tmp/file.pdf',
          originalname: 'invoice.pdf',
          filename: 'stored.pdf',
          mimetype: 'application/pdf',
          size: 5,
        } as Express.Multer.File,
        { shipmentId: shipment.id, documentType: DocumentType.INVOICE },
        user,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(unlinkSpy).toHaveBeenCalledWith('/tmp/file.pdf');
  });

  it('removes the input when shipment lookup fails', async () => {
    shipmentRepo.findOne.mockResolvedValue(null);
    const unlinkSpy = jest
      .spyOn(fs, 'unlinkSync')
      .mockImplementation(() => undefined);

    await expect(
      service.upload(
        {
          path: '/tmp/file.pdf',
          originalname: 'invoice.pdf',
          filename: 'stored.pdf',
          mimetype: 'application/pdf',
          size: 5,
        } as Express.Multer.File,
        { shipmentId: shipment.id, documentType: DocumentType.INVOICE },
        user,
      ),
    ).rejects.toThrow(NotFoundException);

    expect(unlinkSpy).toHaveBeenCalledWith('/tmp/file.pdf');
  });

  it('removes the input when hashing fails', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    const hashError = new Error('read failed');
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw hashError;
    });
    const unlinkSpy = jest
      .spyOn(fs, 'unlinkSync')
      .mockImplementation(() => undefined);

    await expect(
      service.upload(
        {
          path: '/tmp/file.pdf',
          originalname: 'invoice.pdf',
          filename: 'stored.pdf',
          mimetype: 'application/pdf',
          size: 5,
        } as Express.Multer.File,
        { shipmentId: shipment.id, documentType: DocumentType.INVOICE },
        user,
      ),
    ).rejects.toBe(hashError);

    expect(unlinkSpy).toHaveBeenCalledWith('/tmp/file.pdf');
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
      service.findOne('doc-1', {
        id: 'user-2',
        role: UserRole.SHIPPER,
      } as never),
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
    const renameSpy = mockFileRename();
    const unlinkSpy = jest
      .spyOn(fs, 'unlinkSync')
      .mockImplementation(() => undefined);
    documentRepo.remove.mockResolvedValue(undefined);

    await service.delete('doc-1', user);

    expect(renameSpy).toHaveBeenCalledWith(
      '/uploads/stored.pdf',
      expect.stringContaining('/uploads/stored.pdf.'),
    );
    const tombstonePath = String(renameSpy.mock.calls[0][1]);
    expect(documentRepo.remove).toHaveBeenCalled();
    expect(unlinkSpy).toHaveBeenCalledWith(tombstonePath);
  });

  it('does not unlink the file when deleting the database row fails', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    documentRepo.findOne.mockResolvedValue({
      id: 'doc-1',
      shipmentId: shipment.id,
      uploaderId: user.id,
      originalName: 'invoice.pdf',
      storedName: 'stored.pdf',
    });
    const databaseError = new Error('database unavailable');
    documentRepo.remove.mockRejectedValue(databaseError);
    const renameSpy = mockFileRename();
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync');

    await expect(service.delete('doc-1', user)).rejects.toBe(databaseError);

    const tombstonePath = String(renameSpy.mock.calls[0][1]);
    expect(renameSpy).toHaveBeenNthCalledWith(
      1,
      '/uploads/stored.pdf',
      tombstonePath,
    );
    expect(renameSpy).toHaveBeenNthCalledWith(
      2,
      tombstonePath,
      '/uploads/stored.pdf',
    );
    expect(unlinkSpy).not.toHaveBeenCalled();
  });

  it('does not remove metadata when moving the file to a tombstone fails', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    documentRepo.findOne.mockResolvedValue({
      id: 'doc-1',
      shipmentId: shipment.id,
      uploaderId: user.id,
      originalName: 'invoice.pdf',
      storedName: 'stored.pdf',
    });
    const renameError = Object.assign(new Error('permission denied'), {
      code: 'EACCES',
    });
    jest.spyOn(fs, 'renameSync').mockImplementation(() => {
      throw renameError;
    });

    await expect(service.delete('doc-1', user)).rejects.toBe(renameError);

    expect(documentRepo.remove).not.toHaveBeenCalled();
  });

  it('treats an already-missing file as a successful delete', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    documentRepo.findOne.mockResolvedValue({
      id: 'doc-1',
      shipmentId: shipment.id,
      uploaderId: user.id,
      originalName: 'invoice.pdf',
      storedName: 'stored.pdf',
    });
    const missingFileError = Object.assign(new Error('not found'), {
      code: 'ENOENT',
    });
    const renameSpy = jest.spyOn(fs, 'renameSync').mockImplementation(() => {
      throw missingFileError;
    });
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync');
    documentRepo.remove.mockResolvedValue(undefined);

    await expect(service.delete('doc-1', user)).resolves.toBeUndefined();
    expect(renameSpy).toHaveBeenCalledWith(
      '/uploads/stored.pdf',
      expect.any(String),
    );
    expect(unlinkSpy).not.toHaveBeenCalled();
    expect(documentRepo.remove).toHaveBeenCalled();
  });

  it('treats a missing tombstone as a successful final cleanup', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    documentRepo.findOne.mockResolvedValue({
      id: 'doc-1',
      shipmentId: shipment.id,
      uploaderId: user.id,
      originalName: 'invoice.pdf',
      storedName: 'stored.pdf',
    });
    const missingFileError = Object.assign(new Error('not found'), {
      code: 'ENOENT',
    });
    mockFileRename();
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {
      throw missingFileError;
    });
    documentRepo.remove.mockResolvedValue(undefined);

    await expect(service.delete('doc-1', user)).resolves.toBeUndefined();

    expect(documentRepo.remove).toHaveBeenCalled();
    expect(documentRepo.save).not.toHaveBeenCalled();
  });

  it('restores metadata when file deletion fails after the database delete', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    const document = {
      id: 'doc-1',
      shipmentId: shipment.id,
      uploaderId: user.id,
      originalName: 'invoice.pdf',
      storedName: 'stored.pdf',
    };
    documentRepo.findOne.mockResolvedValue(document);
    const fileError = Object.assign(new Error('permission denied'), {
      code: 'EACCES',
    });
    const renameSpy = mockFileRename();
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {
      throw fileError;
    });
    documentRepo.remove.mockResolvedValue(undefined);
    documentRepo.save.mockResolvedValue(document);

    await expect(service.delete('doc-1', user)).rejects.toBe(fileError);

    const tombstonePath = String(renameSpy.mock.calls[0][1]);
    expect(unlinkSpy).toHaveBeenCalledWith(tombstonePath);
    expect(documentRepo.save).toHaveBeenCalledWith(document);
    expect(renameSpy).toHaveBeenNthCalledWith(
      2,
      tombstonePath,
      '/uploads/stored.pdf',
    );
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
