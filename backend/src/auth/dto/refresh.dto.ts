import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ description: 'User ID from the access token' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Refresh token issued at login' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
