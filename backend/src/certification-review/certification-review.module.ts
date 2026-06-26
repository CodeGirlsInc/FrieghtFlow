import { Module } from '@nestjs/common';
import { CertificationReviewService } from './certification-review.service';
import { CertificationReviewController } from './certification-review.controller';

@Module({
  controllers: [CertificationReviewController],
  providers: [CertificationReviewService],
})
export class CertificationReviewModule {}
