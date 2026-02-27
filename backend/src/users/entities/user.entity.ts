import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserRole } from '../../common/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.SHIPPER,
  })
  role: UserRole;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'wallet_address', nullable: true, type: 'varchar' })
  walletAddress: string | null;

  @Column({
    name: 'refresh_token',
    nullable: true,
    type: 'varchar',
    select: false,
  })
  refreshToken: string | null;

  @Column({ name: 'verification_token', nullable: true, type: 'varchar' })
  verificationToken: string | null;

  @Column({
    name: 'verification_token_expiry',
    nullable: true,
    type: 'timestamptz',
  })
  verificationTokenExpiry: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
