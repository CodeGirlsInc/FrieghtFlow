import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateBidDto {
  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  @IsPositive()
  proposedPrice: number;

  @ApiPropertyOptional({ example: 'I can deliver within 3 days.' })
  @IsString()
  @IsOptional()
  message?: string;
}
