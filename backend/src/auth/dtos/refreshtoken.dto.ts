import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'hwdgyueudgwe31212....',
    description: 'The refresh token to get an access token',
  })
  refreshToken: string;
}
