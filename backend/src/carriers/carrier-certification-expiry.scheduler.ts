import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CarrierCertificationsService } from './carrier-certifications.service';

/**
 * Runs the expiry cleanup independently of request traffic. The service method
 * is atomic, so multiple application instances can safely run this job.
 */
@Injectable()
export class CarrierCertificationExpiryScheduler implements OnModuleInit {
  private readonly logger = new Logger(
    CarrierCertificationExpiryScheduler.name,
  );

  constructor(
    private readonly certificationsService: CarrierCertificationsService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.sweep();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async sweep(): Promise<void> {
    try {
      const revoked =
        await this.certificationsService.revokeExpiredCertifications();
      if (revoked > 0) {
        this.logger.log(`Revoked ${revoked} expired carrier certification(s)`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Certification expiry sweep failed: ${message}`);
    }
  }
}
