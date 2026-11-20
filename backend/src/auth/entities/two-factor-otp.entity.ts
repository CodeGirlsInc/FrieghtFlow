import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Persistent state for a user's two-factor enrollment and the most recently
 * issued OTP. Keeping one row per user preserves the old one-outstanding-OTP
 * behavior while allowing any application instance to service a request.
 */
@Entity('two_factor_otps')
export class TwoFactorOtp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // OneToOne owns the one-row-per-user constraint. Do not also mark userId
  // unique on the scalar column, or TypeORM will emit duplicate uniqueness
  // metadata for the same join column.
  @OneToOne(() => User, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'enabled', default: false })
  enabled: boolean;

  // SHA-256 hex digest; the six-digit code is returned to the caller only.
  @Column({
    name: 'otp_code_hash',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  otpCodeHash: string | null;

  @Column({ name: 'otp_expires_at', type: 'timestamptz', nullable: true })
  otpExpiresAt: Date | null;

  @Column({ name: 'otp_used', default: false })
  otpUsed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
