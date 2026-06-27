import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DbHealthIndicator } from './indicators/db.health.indicator';
import { SmtpHealthIndicator } from './indicators/smtp.health.indicator';
import { CloudinaryHealthIndicator } from './indicators/cloudinary.health.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [DbHealthIndicator, SmtpHealthIndicator, CloudinaryHealthIndicator],
})
export class HealthModule {}
