import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DbHealthIndicator } from './indicators/db.health.indicator';
import { SmtpHealthIndicator } from './indicators/smtp.health.indicator';
import { CloudinaryHealthIndicator } from './indicators/cloudinary.health.indicator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dbHealthIndicator: DbHealthIndicator,
    private smtpHealthIndicator: SmtpHealthIndicator,
    private cloudinaryHealthIndicator: CloudinaryHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.dbHealthIndicator.isHealthy('database'),
      () => this.smtpHealthIndicator.isHealthy('smtp'),
      () => this.cloudinaryHealthIndicator.isHealthy('cloudinary'),
    ]);
  }
}
