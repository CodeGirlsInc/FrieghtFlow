import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../../common/validators/is-strong-password.decorator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token from the email link' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewStrongPassword123!' })
  @IsString()
  @IsStrongPassword()
  newPassword: string;
}
