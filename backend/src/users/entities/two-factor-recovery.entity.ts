import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('two_factor_recoveries')
export class TwoFactorRecovery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: number;

  @Column()
  codeHash: string;

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.recoveryCodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
