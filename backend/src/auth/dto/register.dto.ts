import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../../common/enums/role.enum';
import { IsStrongPassword } from '../../common/validators/is-strong-password.decorator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({
    enum: [UserRole.SHIPPER, UserRole.CARRIER],
    default: UserRole.SHIPPER,
  })
  @IsEnum([UserRole.SHIPPER, UserRole.CARRIER], {
    message: 'role must be either shipper or carrier',
  })
  @IsOptional()
  role?: UserRole.SHIPPER | UserRole.CARRIER;
}
