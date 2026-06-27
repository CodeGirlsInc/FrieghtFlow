import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingProgress, OnboardingStep } from './entities/onboarding-progress.entity';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingProgress) private readonly progressRepo: Repository<OnboardingProgress>,
  ) {}

  async getProgress(userId: string): Promise<string[]> {
    const entries = await this.progressRepo.find({ where: { userId }, order: { completedAt: 'ASC' } });
    return entries.map(e => e.step);
  }

  async markStep(userId: string, step: OnboardingStep): Promise<void> {
    const existing = await this.progressRepo.findOne({ where: { userId, step } });
    if (existing) return;
    await this.progressRepo.save(this.progressRepo.create({ userId, step }));
  }
}
