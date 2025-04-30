import { Exclude } from 'class-transformer';
import { RefreshTokenEntity } from 'src/auth/entities/refreshToken.entity';
import { UserRole } from 'src/auth/enums/roles.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 30,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 30,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 40,
  })
  username?: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 64,
  })
  @Exclude()
  password: string;

  @OneToMany(() => RefreshTokenEntity, (token) => token.user)
  @Exclude()
  token: RefreshTokenEntity[];

  @Column({
    default: false,
  })
  isEmailVerified: boolean;

  @Column({
    nullable: true,
  })
  @Exclude()
  emailVerificationToken: string;

  @Column({
    nullable: true,
  })
  @Exclude()
  emailVerificationExpiresIn: Date;

  @Column({
    nullable: true,
  })
  @Exclude()
  passwordResetToken: string;

  @Column({
    nullable: true,
  })
  @Exclude()
  passwordResetExpires: Date;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
