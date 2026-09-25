import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IsNull,
  LessThanOrEqual,
  MoreThan,
  Not,
  Or,
  Repository,
} from 'typeorm';
import { CarrierCertification } from './entities/carrier-certification.entity';
import {
  CreateCarrierCertificationDto,
  UpdateCertificationVerificationDto,
} from './dto/carrier-certification.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class CarrierCertificationsService {
  constructor(
    @InjectRepository(CarrierCertification)
    private readonly certificationRepo: Repository<CarrierCertification>,
    private readonly auditLogService: AuditLogService,
    private readonly documentsService: DocumentsService,
  ) {}

  async create(
    carrierId: string,
    dto: CreateCarrierCertificationDto,
  ): Promise<CarrierCertification> {
    // Keep this guard at the service boundary as well as in the DTO. It
    // prevents an internal caller or a future controller that forgets the
    // global whitelist pipe from reintroducing arbitrary external URLs.
    if (dto.fileUrl !== undefined) {
      throw new BadRequestException(
        'fileUrl is not accepted; upload the certification through the platform document endpoint',
      );
    }

    // A document id is only useful when the upload service proves that the
    // current carrier owns it. This prevents a carrier from attaching another
    // carrier's platform document by guessing/stealing its UUID.
    const document = await this.documentsService.getOwnedCertificationDocument(
      dto.documentId,
      carrierId,
    );
    const documentId = document.id ?? dto.documentId;

    const existing = await this.certificationRepo.findOne({
      where: { documentId },
    });
    if (existing) {
      throw new ConflictException(
        'This platform document is already attached to a certification',
      );
    }

    const expiresAt = this.parseFutureExpiry(dto.expiresAt);
    const certification = this.certificationRepo.create({
      carrierId,
      documentType: dto.documentType,
      // Never copy a client-supplied URL. The document relation and its
      // ownership record are the source of truth for the file.
      fileUrl: null,
      document,
      documentId,
      isPlatformHosted: true,
      issuedBy: dto.issuedBy,
      expiresAt,
      notes: dto.notes ?? null,
      isVerified: false,
      verificationRevokedAt: null,
    });

    return this.certificationRepo.save(certification);
  }

  async findByCarrierId(carrierId: string): Promise<CarrierCertification[]> {
    // Reads are intentionally side-effect free. Expiry is handled by the
    // atomic scheduled sweep and by conditional verification updates.
    return this.certificationRepo.find({
      where: { carrierId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<CarrierCertification> {
    const certification = await this.certificationRepo.findOne({
      where: { id },
    });
    if (!certification) {
      throw new NotFoundException(`Certification ${id} not found`);
    }
    return certification;
  }

  async updateVerification(
    id: string,
    dto: UpdateCertificationVerificationDto,
    adminId: string,
  ): Promise<CarrierCertification> {
    const certification = await this.findOne(id);
    let verifiedDocument:
      | Awaited<ReturnType<DocumentsService['getOwnedCertificationDocument']>>
      | undefined;

    if (dto.isVerified) {
      if (!certification.documentId || !certification.isPlatformHosted) {
        throw new BadRequestException(
          'Only certifications backed by a platform-hosted document can be verified',
        );
      }
      if (certification.verificationRevokedAt) {
        throw new BadRequestException(
          'A certification revoked by the expiry sweep cannot be re-verified',
        );
      }
      if (this.isExpired(certification)) {
        throw new BadRequestException(
          'Expired certifications cannot be verified',
        );
      }

      // Re-check ownership at verification time as well as creation time. This
      // protects the admin action if a document is removed or its provenance
      // is altered between submission and review.
      verifiedDocument =
        await this.documentsService.getOwnedCertificationDocument(
          certification.documentId,
          certification.carrierId,
        );
    }

    const now = new Date();
    const update = {
      isVerified: dto.isVerified,
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
    };

    // Verification is a single conditional UPDATE. A stale read/save could
    // otherwise re-enable a row after the expiry sweep won the race.
    const result = dto.isVerified
      ? await this.certificationRepo.update(
          {
            id,
            isPlatformHosted: true,
            documentId: Not(IsNull()),
            expiresAt: Or(IsNull(), MoreThan(now)),
            verificationRevokedAt: IsNull(),
          },
          update,
        )
      : await this.certificationRepo.update(id, update);

    if ((result?.affected ?? 0) === 0) {
      const current = await this.findOne(id);
      if (dto.isVerified) {
        if (this.isExpired(current, now)) {
          throw new BadRequestException(
            'Expired certifications cannot be verified',
          );
        }
        if (current.verificationRevokedAt) {
          throw new BadRequestException(
            'A certification revoked by the expiry sweep cannot be re-verified',
          );
        }
        if (!current.documentId || !current.isPlatformHosted) {
          throw new BadRequestException(
            'Only certifications backed by a platform-hosted document can be verified',
          );
        }
        throw new BadRequestException(
          'Certification changed while verifying; please retry',
        );
      }
      throw new BadRequestException('Certification could not be updated');
    }

    // Reload only for the response/audit payload; this read never writes.
    const saved = await this.findOne(id);
    await this.auditLogService.log({
      adminId,
      action: dto.isVerified
        ? 'CERTIFICATION_VERIFIED'
        : 'CERTIFICATION_UNVERIFIED',
      targetType: 'CarrierCertification',
      targetId: saved.id,
      metadata: {
        carrierId: saved.carrierId,
        documentType: saved.documentType,
        isVerified: saved.isVerified,
        documentId: saved.documentId,
        isPlatformHosted: saved.isPlatformHosted,
        documentUploaderId: verifiedDocument?.uploaderId ?? null,
        documentStorageType: verifiedDocument?.documentType ?? null,
        documentSha256Hash: verifiedDocument?.sha256Hash ?? null,
        expiresAt: this.serializeDate(saved.expiresAt),
        verificationRevokedAt: this.serializeDate(saved.verificationRevokedAt),
      },
    });

    return saved;
  }

  /**
   * Atomically revokes every currently verified certification whose expiry
   * has passed. The scheduled job calls this method, and the revocation marker
   * prevents a stale admin request from re-enabling the row later.
   */
  async revokeExpiredCertifications(now = new Date()): Promise<number> {
    const result = await this.certificationRepo.update(
      {
        isVerified: true,
        expiresAt: LessThanOrEqual(now),
      },
      {
        isVerified: false,
        verificationRevokedAt: now,
      },
    );

    return result?.affected ?? 0;
  }

  async delete(id: string, carrierId: string): Promise<void> {
    const certification = await this.findOne(id);

    if (certification.carrierId !== carrierId) {
      throw new ForbiddenException(
        'You can only delete your own certifications',
      );
    }

    await this.certificationRepo.remove(certification);
  }

  private parseFutureExpiry(value: string | undefined): Date | null {
    if (value === undefined || value === null) return null;

    const expiry = new Date(value);
    if (Number.isNaN(expiry.getTime()) || expiry.getTime() <= Date.now()) {
      throw new BadRequestException(
        'expiresAt must be a valid date in the future',
      );
    }
    return expiry;
  }

  private isExpired(
    certification: CarrierCertification,
    now = new Date(),
  ): boolean {
    if (!certification.expiresAt) return false;
    const expiry =
      certification.expiresAt instanceof Date
        ? certification.expiresAt
        : new Date(certification.expiresAt);
    return Number.isNaN(expiry.getTime()) || expiry.getTime() <= now.getTime();
  }

  private serializeDate(value: Date | null): string | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
}
