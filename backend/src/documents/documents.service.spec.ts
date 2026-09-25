import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { CarrierCertification } from '../carriers/entities/carrier-certification.entity';
import { DocumentType } from './enums/document-type.enum';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';

const PDF_BYTES = Buffer.from('%PDF-1.7\nvalid test document\n%%EOF');

function makeFile(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    buffer: PDF_BYTES,
    originalname: 'invoice.pdf',
    filename: 'untrusted-client-name.exe',
    mimetype: 'application/pdf',
    size: PDF_BYTES.length,
    ...overrides,
  } as Express.Multer.File;
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
  let certificationRepo: { findOne: jest.Mock };

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
    certificationRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: getRepositoryToken(Document), useValue: documentRepo },
        { provide: getRepositoryToken(Shipment), useValue: shipmentRepo },
        {
          provide: getRepositoryToken(CarrierCertification),
          useValue: certificationRepo,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('/uploads') },
        },
      ],
    }).compile();

    service = module.get(DocumentsService);
    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('verifies content, hashes bytes, and derives a safe extension', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    const expectedHash = crypto
      .createHash('sha256')
      .update(PDF_BYTES)
      .digest('hex');
    documentRepo.save.mockImplementation((value: unknown) => value);

    const result = await service.upload(
      makeFile({ originalname: '../../invoice.exe' }),
      { shipmentId: shipment.id, documentType: DocumentType.INVOICE },
      user,
    );

    expect(result.sha256Hash).toBe(expectedHash);
    expect(result.mimetype).toBe('application/pdf');
    expect(result.sizeBytes).toBe(PDF_BYTES.length);
    expect(result.storedName).toMatch(/^[0-9a-f-]{36}\.pdf$/);
    expect(result.originalName).toBe('invoice.exe');
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `/uploads/${result.storedName}`,
      PDF_BYTES,
      { flag: 'wx' },
    );
  });

  it('rejects a MIME/content mismatch before writing a file', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);

    await expect(
      service.upload(
        makeFile({ buffer: Buffer.from('not a pdf') }),
        { shipmentId: shipment.id, documentType: DocumentType.INVOICE },
        user,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(documentRepo.save).not.toHaveBeenCalled();
  });

  it('uploads a platform-owned certification document without a shipment', async () => {
    const carrier = { id: 'carrier-1', role: UserRole.CARRIER } as User;
    documentRepo.save.mockImplementation((value: unknown) => value);

    await service.uploadCertificationDocument(makeFile(), carrier);

    expect(documentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        shipmentId: null,
        uploaderId: carrier.id,
        documentType: DocumentType.CARRIER_CERTIFICATION,
        mimetype: 'application/pdf',
      }),
    );
  });

  it('removes a written file when persistence fails', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    documentRepo.save.mockRejectedValue(new Error('database unavailable'));

    await expect(
      service.upload(
        makeFile(),
        { shipmentId: shipment.id, documentType: DocumentType.INVOICE },
        user,
      ),
    ).rejects.toThrow('database unavailable');
    expect(fs.unlinkSync).toHaveBeenCalledWith(
      expect.stringMatching(/^\/uploads\/[0-9a-f-]{36}\.pdf$/),
    );
  });

  it('only resolves certification documents owned by the requesting carrier', async () => {
    documentRepo.findOne.mockResolvedValue({
      id: 'cert-document-1',
      shipmentId: null,
      uploaderId: 'carrier-2',
      documentType: DocumentType.CARRIER_CERTIFICATION,
    });

    await expect(
      service.getOwnedCertificationDocument('cert-document-1', 'carrier-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects a shipment document as a certification document', async () => {
    documentRepo.findOne.mockResolvedValue({
      id: 'shipment-document-1',
      shipmentId: shipment.id,
      uploaderId: user.id,
      documentType: DocumentType.INVOICE,
    });

    await expect(
      service.getOwnedCertificationDocument('shipment-document-1', user.id),
    ).rejects.toThrow('platform-hosted certification document');
  });

  it('allows the uploader to access an unbound certification document', async () => {
    documentRepo.findOne.mockResolvedValue({
      id: 'cert-document-1',
      shipmentId: null,
      uploaderId: user.id,
      documentType: DocumentType.CARRIER_CERTIFICATION,
      storedName: 'stored-certificate.pdf',
      originalName: 'certificate.pdf',
    });

    await expect(service.findOne('cert-document-1', user)).resolves.toEqual(
      expect.objectContaining({ id: 'cert-document-1' }),
    );
    expect(shipmentRepo.findOne).not.toHaveBeenCalled();
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

  it('contains stored paths when returning a file path', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    documentRepo.findOne.mockResolvedValue({
      id: 'doc-1',
      shipmentId: shipment.id,
      uploaderId: user.id,
      originalName: 'invoice.pdf',
      storedName: '../outside.pdf',
    });

    await expect(service.getFilePath('doc-1', user)).rejects.toThrow(
      BadRequestException,
    );
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

  it('removes the database row before unlinking an unreferenced document', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    documentRepo.findOne.mockResolvedValue({
      id: 'doc-1',
      shipmentId: shipment.id,
      uploaderId: user.id,
      originalName: 'invoice.pdf',
      storedName: 'stored.pdf',
    });
    certificationRepo.findOne.mockResolvedValue(null);
    documentRepo.remove.mockResolvedValue(undefined);

    await service.delete('doc-1', user);

    expect(documentRepo.remove).toHaveBeenCalled();
    expect(fs.unlinkSync).toHaveBeenCalledWith('/uploads/stored.pdf');
    expect(documentRepo.remove.mock.invocationCallOrder[0]).toBeLessThan(
      (fs.unlinkSync as unknown as jest.Mock).mock.invocationCallOrder[0],
    );
  });

  it('refuses to delete a document referenced by a certification', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    documentRepo.findOne.mockResolvedValue({
      id: 'doc-1',
      shipmentId: null,
      uploaderId: user.id,
      originalName: 'certificate.pdf',
      storedName: 'stored-certificate.pdf',
    });
    certificationRepo.findOne.mockResolvedValue({
      id: 'cert-1',
      isVerified: true,
    });

    await expect(service.delete('doc-1', user)).rejects.toThrow(
      ConflictException,
    );
    expect(documentRepo.remove).not.toHaveBeenCalled();
    expect(fs.unlinkSync).not.toHaveBeenCalled();
  });

  it('keeps the file when the database FK wins a deletion race', async () => {
    shipmentRepo.findOne.mockResolvedValue(shipment);
    documentRepo.findOne.mockResolvedValue({
      id: 'doc-1',
      shipmentId: shipment.id,
      uploaderId: user.id,
      originalName: 'invoice.pdf',
      storedName: 'stored.pdf',
    });
    certificationRepo.findOne.mockResolvedValue(null);
    documentRepo.remove.mockRejectedValue({
      driverError: { code: '23503' },
    });

    await expect(service.delete('doc-1', user)).rejects.toThrow(
      ConflictException,
    );
    expect(fs.unlinkSync).not.toHaveBeenCalled();
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
