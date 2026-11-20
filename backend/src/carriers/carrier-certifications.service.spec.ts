import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CarrierCertificationsService } from './carrier-certifications.service';
import {
  CarrierCertification,
  CertificationType,
} from './entities/carrier-certification.entity';
import {
  CreateCarrierCertificationDto,
  UpdateCertificationVerificationDto,
} from './dto/carrier-certification.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { DocumentsService } from '../documents/documents.service';
import { DocumentType } from '../documents/enums/document-type.enum';

const DOCUMENT_ID = '4c5e6f70-8b9a-4c1d-9e2f-1234567890ab';

function makeCertification(
  overrides: Partial<CarrierCertification> = {},
): CarrierCertification {
  return {
    id: 'cert-uuid-1',
    carrierId: 'carrier-uuid-1',
    documentType: CertificationType.OPERATING_LICENSE,
    fileUrl: null,
    document: null,
    documentId: DOCUMENT_ID,
    isPlatformHosted: true,
    issuedBy: 'FMCSA',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isVerified: false,
    verificationRevokedAt: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function mockRepo() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<{
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    update: jest.Mock;
  }>;
}

describe('CarrierCertificationsService', () => {
  let service: CarrierCertificationsService;
  let certificationRepo: ReturnType<typeof mockRepo>;
  let auditLogService: { log: jest.Mock };
  let documentsService: {
    getOwnedCertificationDocument: jest.Mock;
  };

  beforeEach(async () => {
    certificationRepo = mockRepo();
    auditLogService = { log: jest.fn() };
    documentsService = {
      getOwnedCertificationDocument: jest.fn().mockResolvedValue({
        id: DOCUMENT_ID,
        uploaderId: 'carrier-uuid-1',
        documentType: DocumentType.CARRIER_CERTIFICATION,
        shipmentId: null,
        sha256Hash: 'a'.repeat(64),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarrierCertificationsService,
        {
          provide: getRepositoryToken(CarrierCertification),
          useValue: certificationRepo,
        },
        {
          provide: AuditLogService,
          useValue: auditLogService,
        },
        {
          provide: DocumentsService,
          useValue: documentsService,
        },
      ],
    }).compile();

    service = module.get<CarrierCertificationsService>(
      CarrierCertificationsService,
    );
  });

  describe('create()', () => {
    it('creates an unverified certification tied to an owned platform document', async () => {
      const dto: CreateCarrierCertificationDto = {
        documentType: CertificationType.OPERATING_LICENSE,
        documentId: DOCUMENT_ID,
        issuedBy: 'FMCSA',
        expiresAt: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        notes: 'Valid license',
      };
      certificationRepo.findOne.mockResolvedValue(undefined);
      certificationRepo.create.mockImplementation((value: unknown) => value);
      certificationRepo.save.mockImplementation((value: unknown) => value);

      const result = await service.create('carrier-uuid-1', dto);

      expect(
        documentsService.getOwnedCertificationDocument,
      ).toHaveBeenCalledWith(dto.documentId, 'carrier-uuid-1');
      expect(certificationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          carrierId: 'carrier-uuid-1',
          documentType: CertificationType.OPERATING_LICENSE,
          fileUrl: null,
          documentId: DOCUMENT_ID,
          isPlatformHosted: true,
          isVerified: false,
          verificationRevokedAt: null,
          document: expect.objectContaining({ id: DOCUMENT_ID }),
        }),
      );
      expect(result.documentId).toBe(DOCUMENT_ID);
    });

    it('rejects a legacy external fileUrl even when called directly', async () => {
      await expect(
        service.create('carrier-uuid-1', {
          documentType: CertificationType.OPERATING_LICENSE,
          documentId: DOCUMENT_ID,
          issuedBy: 'FMCSA',
          fileUrl: 'https://attacker.example/cert.pdf',
        } as CreateCarrierCertificationDto),
      ).rejects.toThrow('fileUrl is not accepted');
      expect(certificationRepo.create).not.toHaveBeenCalled();
    });

    it('rejects a past expiry even when called outside the HTTP pipe', async () => {
      certificationRepo.findOne.mockResolvedValue(undefined);

      await expect(
        service.create('carrier-uuid-1', {
          documentType: CertificationType.OPERATING_LICENSE,
          documentId: DOCUMENT_ID,
          issuedBy: 'FMCSA',
          expiresAt: new Date(Date.now() - 1000).toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
      expect(certificationRepo.save).not.toHaveBeenCalled();
    });

    it('does not create a certification when document ownership fails', async () => {
      documentsService.getOwnedCertificationDocument.mockRejectedValueOnce(
        new ForbiddenException('not your document'),
      );

      await expect(
        service.create('carrier-uuid-1', {
          documentType: CertificationType.OPERATING_LICENSE,
          documentId: DOCUMENT_ID,
          issuedBy: 'FMCSA',
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(certificationRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('reads', () => {
    it('returns certifications without mutating or saving stale entities', async () => {
      const expired = makeCertification({
        isVerified: true,
        expiresAt: new Date(Date.now() - 1000),
      });
      certificationRepo.find.mockResolvedValue([expired]);

      const result = await service.findByCarrierId('carrier-uuid-1');

      expect(certificationRepo.find).toHaveBeenCalledWith({
        where: { carrierId: 'carrier-uuid-1' },
        order: { createdAt: 'DESC' },
      });
      expect(result[0].isVerified).toBe(true);
      expect(certificationRepo.save).not.toHaveBeenCalled();
    });

    it('returns a certification by id without expiry writes', async () => {
      const expired = makeCertification({
        isVerified: true,
        expiresAt: new Date(Date.now() - 1000),
      });
      certificationRepo.findOne.mockResolvedValue(expired);

      await expect(service.findOne('cert-uuid-1')).resolves.toBe(expired);
      expect(certificationRepo.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when certification does not exist', async () => {
      certificationRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateVerification()', () => {
    it('uses a conditional update and returns the fresh row', async () => {
      const certification = makeCertification();
      const fresh = makeCertification({
        isVerified: true,
        notes: 'Verified by admin',
      });
      certificationRepo.findOne
        .mockResolvedValueOnce(certification)
        .mockResolvedValueOnce(fresh);
      certificationRepo.update.mockResolvedValue({ affected: 1 });
      const dto: UpdateCertificationVerificationDto = {
        isVerified: true,
        notes: 'Verified by admin',
      };

      const result = await service.updateVerification(
        'cert-uuid-1',
        dto,
        'admin-uuid-1',
      );

      expect(certificationRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'cert-uuid-1',
          isPlatformHosted: true,
          documentId: expect.objectContaining({ _type: 'not' }),
          expiresAt: expect.objectContaining({ _type: 'or' }),
          verificationRevokedAt: expect.objectContaining({ _type: 'isNull' }),
        }),
        { isVerified: true, notes: 'Verified by admin' },
      );
      expect(certificationRepo.save).not.toHaveBeenCalled();
      expect(result).toBe(fresh);
    });

    it('records document provenance in verification audit metadata', async () => {
      const certification = makeCertification();
      const fresh = makeCertification({ isVerified: true });
      certificationRepo.findOne
        .mockResolvedValueOnce(certification)
        .mockResolvedValueOnce(fresh);
      certificationRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateVerification(
        'cert-uuid-1',
        { isVerified: true },
        'admin-uuid-1',
      );

      expect(auditLogService.log).toHaveBeenCalledWith({
        adminId: 'admin-uuid-1',
        action: 'CERTIFICATION_VERIFIED',
        targetType: 'CarrierCertification',
        targetId: 'cert-uuid-1',
        metadata: expect.objectContaining({
          carrierId: 'carrier-uuid-1',
          documentId: DOCUMENT_ID,
          isPlatformHosted: true,
          documentUploaderId: 'carrier-uuid-1',
          documentStorageType: DocumentType.CARRIER_CERTIFICATION,
          documentSha256Hash: 'a'.repeat(64),
          isVerified: true,
        }),
      });
    });

    it('does not re-enable a row after the expiry sweep wins the race', async () => {
      const certification = makeCertification();
      const revoked = makeCertification({
        isVerified: false,
        verificationRevokedAt: new Date(),
      });
      certificationRepo.findOne
        .mockResolvedValueOnce(certification)
        .mockResolvedValueOnce(revoked);
      certificationRepo.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.updateVerification(
          'cert-uuid-1',
          { isVerified: true },
          'admin-uuid-1',
        ),
      ).rejects.toThrow('revoked by the expiry sweep');
      expect(certificationRepo.save).not.toHaveBeenCalled();
    });

    it('rejects verification for a legacy or untrusted document', async () => {
      certificationRepo.findOne.mockResolvedValue(
        makeCertification({ documentId: null, isPlatformHosted: false }),
      );

      await expect(
        service.updateVerification(
          'cert-uuid-1',
          { isVerified: true },
          'admin-uuid-1',
        ),
      ).rejects.toThrow(BadRequestException);
      expect(certificationRepo.update).not.toHaveBeenCalled();
    });

    it('re-checks platform document ownership before verification', async () => {
      certificationRepo.findOne.mockResolvedValue(makeCertification());
      documentsService.getOwnedCertificationDocument.mockRejectedValueOnce(
        new ForbiddenException('document is no longer owned'),
      );

      await expect(
        service.updateVerification(
          'cert-uuid-1',
          { isVerified: true },
          'admin-uuid-1',
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(certificationRepo.update).not.toHaveBeenCalled();
    });

    it('rejects verification of an expired certification', async () => {
      certificationRepo.findOne.mockResolvedValue(
        makeCertification({ expiresAt: new Date(Date.now() - 1000) }),
      );

      await expect(
        service.updateVerification(
          'cert-uuid-1',
          { isVerified: true },
          'admin-uuid-1',
        ),
      ).rejects.toThrow('Expired certifications cannot be verified');
      expect(certificationRepo.update).not.toHaveBeenCalled();
    });

    it('uses an atomic update for unverification and audits provenance fields', async () => {
      const certification = makeCertification({ isVerified: true });
      const fresh = makeCertification({ isVerified: false });
      certificationRepo.findOne
        .mockResolvedValueOnce(certification)
        .mockResolvedValueOnce(fresh);
      certificationRepo.update.mockResolvedValue({ affected: 1 });

      await service.updateVerification(
        'cert-uuid-1',
        { isVerified: false, notes: 'Revoked by admin' },
        'admin-uuid-1',
      );

      expect(certificationRepo.update).toHaveBeenCalledWith('cert-uuid-1', {
        isVerified: false,
        notes: 'Revoked by admin',
      });
      expect(certificationRepo.save).not.toHaveBeenCalled();
      expect(auditLogService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CERTIFICATION_UNVERIFIED',
          metadata: expect.objectContaining({
            documentId: DOCUMENT_ID,
            isPlatformHosted: true,
            documentUploaderId: null,
            documentSha256Hash: null,
          }),
        }),
      );
    });
  });

  describe('revokeExpiredCertifications()', () => {
    it('atomically clears verification and records a revocation marker', async () => {
      const now = new Date('2026-09-25T12:00:00.000Z');
      certificationRepo.update.mockResolvedValue({ affected: 3 });

      const result = await service.revokeExpiredCertifications(now);

      expect(result).toBe(3);
      expect(certificationRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          isVerified: true,
          expiresAt: expect.objectContaining({
            _type: 'lessThanOrEqual',
            _value: now,
          }),
        }),
        { isVerified: false, verificationRevokedAt: now },
      );
    });
  });

  describe('delete()', () => {
    it('allows a carrier to delete their own certification', async () => {
      const certification = makeCertification({
        carrierId: 'carrier-uuid-1',
      });
      certificationRepo.findOne.mockResolvedValue(certification);

      await service.delete('cert-uuid-1', 'carrier-uuid-1');

      expect(certificationRepo.remove).toHaveBeenCalledWith(certification);
    });

    it('throws ForbiddenException when trying to delete another carrier certification', async () => {
      const certification = makeCertification({
        carrierId: 'other-carrier',
      });
      certificationRepo.findOne.mockResolvedValue(certification);

      await expect(
        service.delete('cert-uuid-1', 'carrier-uuid-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
