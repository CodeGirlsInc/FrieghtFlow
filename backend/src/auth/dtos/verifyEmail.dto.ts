import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'fgwueff374rgfweuef',
    description: 'Email verification token',
  })
  token: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'jdfhwef-efw-dfsf-asoac',
    description: 'ID of the user',
  })
  userId: string;
}
