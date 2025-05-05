import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({
    example: 'john',
    description: 'User first name',
  })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({
    example: 'doe',
    description: 'User last name',
  })
  lastName: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  @ApiPropertyOptional({
    example: 'johnny',
    description: 'User username',
  })
  username?: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'johndoe@gmail.com',
    description: 'User email',
  })
  email: string;

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
}
