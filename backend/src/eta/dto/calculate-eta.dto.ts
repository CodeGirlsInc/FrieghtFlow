import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CalculateETADto {
  @ApiProperty({ example: 'Lagos' })
  @IsString()
  originCity: string;

  @ApiProperty({ example: 'Abuja' })
  @IsString()
  destinationCity: string;

  @ApiPropertyOptional({ example: 'uuid-of-carrier' })
  @IsUUID()
  @IsOptional()
  carrierId?: string;
}
