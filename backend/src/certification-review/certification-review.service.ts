import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class CertificationReviewService {
  constructor(
    @InjectRepository(null as never)
    private readonly dummyRepo: Repository<never>,
    private readonly mailerService: MailerService,
  ) {}

  findPending(page = 1, limit = 20) {
    return Promise.resolve({ data: [], total: 0, page, limit, totalPages: 0 });
  }

  approve(
    certificationId: string,
    adminId: string,
  ): Promise<{ message: string }> {
    return Promise.resolve({
      message: `Certification ${certificationId} approved by admin ${adminId}`,
    });
  }

  reject(
    certificationId: string,
    adminId: string,
    reason: string,
  ): Promise<{ message: string }> {
    if (!reason) throw new NotFoundException('Rejection reason is required');
    return Promise.resolve({
      message: `Certification ${certificationId} rejected by admin ${adminId}: ${reason}`,
    });
  }
}
