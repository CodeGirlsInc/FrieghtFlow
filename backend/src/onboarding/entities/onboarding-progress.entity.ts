import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

export enum OnboardingStep {
  PROFILE_COMPLETE = 'PROFILE_COMPLETE',
  FIRST_SHIPMENT = 'FIRST_SHIPMENT',
  WALLET_LINKED = 'WALLET_LINKED',
  NOTIFICATION_SET = 'NOTIFICATION_SET',
}

@Entity('onboarding_progress')
@Unique(['userId', 'step'])
export class OnboardingProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: OnboardingStep })
  step: OnboardingStep;

  @CreateDateColumn({ name: 'completed_at' })
  completedAt: Date;
}
