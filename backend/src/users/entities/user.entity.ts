import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 320,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'boolean',
    default: false,
  })
  emailVerified: boolean;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  emailVerificationToken?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  emailVerificationTokenExpiry?: Date;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  passwordResetToken?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  passwordResetTokenExpiry?: Date;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phoneNumber?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  address?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  city?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  country?: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  postalCode?: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfBirth?: Date;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Helper methods
  public isEmailVerified(): boolean {
    return this.emailVerified;
  }

  public isTokenValid(token: string, expiry: Date | null): boolean {
    if (!token || !expiry) {
      return false;
    }
    return new Date() < expiry;
  }

  public isPasswordResetTokenValid(): boolean {
    return this.isTokenValid(
      this.passwordResetToken || '',
      this.passwordResetTokenExpiry || null,
    );
  }

  public isEmailVerificationTokenValid(): boolean {
    return this.isTokenValid(
      this.emailVerificationToken || '',
      this.emailVerificationTokenExpiry || null,
    );
  }
}
