import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/auth/enums/roles.enum';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'John',
    description: 'first name of the admin user',
  })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({
    example: 'Doe',
    description: 'last name of the admin user',
  })
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({
    example: 'John',
    description: 'first name of the admin user',
  })
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  @ApiPropertyOptional({
    example: 'johnny',
    description: 'admin username',
  })
  username?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_.]).+$/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&-_.).',
  })
  @ApiProperty({
    example: 'P@ssw0rd123!',
    description:
      'Strong password with at least one uppercase, one lowercase, one number, and one special character',
  })
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  @ApiProperty({
    example: 'Admin',
    description: 'The role of the user',
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  role: UserRole = UserRole.ADMIN;
}
