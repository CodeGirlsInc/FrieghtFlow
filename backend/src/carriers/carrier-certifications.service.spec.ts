import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CarrierCertificationsService } from './carrier-certifications.service';
import { CarrierCertification, CertificationType } from './entities/carrier-certification.entity';
import {
  CreateCarrierCertificationDto,
  UpdateCertificationVerificationDto,
} from './dto/carrier-certification.dto';

function makeCertification(
  overrides: Partial<CarrierCertification> = {},
): CarrierCertification {
  return {
    id: 'cert-uuid-1',
    carrierId: 'carrier-uuid-1',
    documentType: CertificationType.OPERATING_LICENSE,
    fileUrl: 'https://example.com/cert.pdf',
    issuedBy: 'FMCSA',
    expiresAt: new Date('2027-12-31'),
    isVerified: false,
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
  } as unknown as jest.Mocked<{
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  }>;
}

describe('CarrierCertificationsService', () => {
  let service: CarrierCertificationsService;
  let certificationRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    certificationRepo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarrierCertificationsService,
        {
          provide: getRepositoryToken(CarrierCertification),
          useValue: certificationRepo,
        },
      ],
    }).compile();

    service = module.get<CarrierCertificationsService>(
      CarrierCertificationsService,
    );
  });

  describe('create()', () => {
    it('creates a certification with isVerified set to false', async () => {
      const dto: CreateCarrierCertificationDto = {
        documentType: CertificationType.OPERATING_LICENSE,
        fileUrl: 'https://example.com/license.pdf',
        issuedBy: 'FMCSA',
        expiresAt: '2027-12-31T23:59:59Z',
        notes: 'Valid license',
      };

      const certification = makeCertification();
      certificationRepo.create.mockReturnValue(certification);
      certificationRepo.save.mockResolvedValue(certification);

      const result = await service.create('carrier-uuid-1', dto);

      expect(certificationRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          carrierId: 'carrier-uuid-1',
          documentType: CertificationType.OPERATING_LICENSE,
          isVerified: false,
        }),
      );
      expect(result).toEqual(certification);
    });
  });

  describe('findByCarrierId()', () => {
    it('returns all certifications for a carrier ordered by createdAt DESC', async () => {
      const certs = [
        makeCertification({ id: 'cert-1', createdAt: new Date('2026-01-01') }),
        makeCertification({ id: 'cert-2', createdAt: new Date('2026-02-01') }),
      ];
      certificationRepo.find.mockResolvedValue(certs);

      const result = await service.findByCarrierId('carrier-uuid-1');

      expect(certificationRepo.find).toHaveBeenCalledWith({
        where: { carrierId: 'carrier-uuid-1' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(certs);
    });
  });

  describe('findOne()', () => {
    it('returns a certification by id', async () => {
      const certification = makeCertification();
      certificationRepo.findOne.mockResolvedValue(certification);

      const result = await service.findOne('cert-uuid-1');

      expect(result).toEqual(certification);
    });

    it('throws NotFoundException when certification does not exist', async () => {
      certificationRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateVerification()', () => {
    it('updates isVerified status and notes', async () => {
      const certification = makeCertification();
      const dto: UpdateCertificationVerificationDto = {
        isVerified: true,
        notes: 'Verified by admin',
      };

      certificationRepo.findOne.mockResolvedValue(certification);
      certificationRepo.save.mockResolvedValue({
        ...certification,
        isVerified: true,
        notes: 'Verified by admin',
      });

      const result = await service.updateVerification('cert-uuid-1', dto);

      expect(certificationRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isVerified: true,
          notes: 'Verified by admin',
        }),
      );
      expect(result.isVerified).toBe(true);
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
