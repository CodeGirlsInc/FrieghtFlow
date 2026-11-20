import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ON DELETE RESTRICT prevents audit rows from being silently deleted when
   * the admin account is removed. Prefer deactivating admins over deleting
   * them. adminId is nullable so the row survives a SET NULL path if a future
   * migration switches to that strategy instead.
   */
  @ManyToOne(() => User, { eager: false, nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'admin_id' })
  admin: User | null;

  @Index()
  @Column({ name: 'admin_id', nullable: true, type: 'uuid' })
  adminId: string | null;

  @Index()
  @Column({ length: 100 })
  action: string;

  @Column({ name: 'target_type', length: 100, nullable: true, type: 'varchar' })
  targetType: string | null;

  @Column({ name: 'target_id', nullable: true, type: 'varchar' })
  targetId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
