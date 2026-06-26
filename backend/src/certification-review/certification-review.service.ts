import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';

interface Certification {
  id: string;
  carrierId: string;
  isVerified: boolean;
  status: string;
  fileName?: string;
}

@Injectable()
export class CertificationReviewService {
  constructor(
    @InjectRepository(null as never) private readonly dummyRepo: Repository<never>,
    private readonly mailerService: MailerService,
  ) {}

  async findPending(page = 1, limit = 20) {
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  async approve(certificationId: string, adminId: string): Promise<{ message: string }> {
    return { message: `Certification ${certificationId} approved by admin ${adminId}` };
  }

  async reject(certificationId: string, adminId: string, reason: string): Promise<{ message: string }> {
    if (!reason) throw new NotFoundException('Rejection reason is required');
    return { message: `Certification ${certificationId} rejected by admin ${adminId}: ${reason}` };
  }
}
