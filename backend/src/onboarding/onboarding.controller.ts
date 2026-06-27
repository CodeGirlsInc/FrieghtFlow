import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { OnboardingStep } from './entities/onboarding-progress.entity';

@ApiTags('onboarding')
@ApiBearerAuth()
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('progress')
  @ApiOperation({ summary: 'Get current user onboarding progress' })
  getProgress(@CurrentUser() user: User) {
    return this.onboardingService.getProgress(user.id);
  }

  @Post('step/:stepName')
  @ApiOperation({ summary: 'Mark an onboarding step as complete (idempotent)' })
  markStep(
    @CurrentUser() user: User,
    @Param('stepName') stepName: OnboardingStep,
  ) {
    return this.onboardingService.markStep(user.id, stepName);
  }
}
