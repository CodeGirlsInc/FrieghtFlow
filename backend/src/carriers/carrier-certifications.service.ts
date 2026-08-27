import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarrierCertification } from './entities/carrier-certification.entity';
import {
  CreateCarrierCertificationDto,
  UpdateCertificationVerificationDto,
} from './dto/carrier-certification.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class CarrierCertificationsService {
  constructor(
    @InjectRepository(CarrierCertification)
    private readonly certificationRepo: Repository<CarrierCertification>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    carrierId: string,
    dto: CreateCarrierCertificationDto,
  ): Promise<CarrierCertification> {
    const certification = this.certificationRepo.create({
      carrierId,
      documentType: dto.documentType,
      fileUrl: dto.fileUrl,
      issuedBy: dto.issuedBy,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      notes: dto.notes ?? null,
      isVerified: false,
    });

    return this.certificationRepo.save(certification);
  }

  async findByCarrierId(carrierId: string): Promise<CarrierCertification[]> {
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

    certification.isVerified = dto.isVerified;
    if (dto.notes !== undefined) {
      certification.notes = dto.notes;
    }

    const saved = await this.certificationRepo.save(certification);

    await this.auditLogService.log({
      adminId,
      action: dto.isVerified
        ? 'CERTIFICATION_VERIFIED'
        : 'CERTIFICATION_UNVERIFIED',
      targetType: 'CarrierCertification',
      targetId: certification.id,
      metadata: {
        carrierId: certification.carrierId,
        documentType: certification.documentType,
        isVerified: dto.isVerified,
      },
    });

    return saved;
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
}
