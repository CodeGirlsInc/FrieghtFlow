import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, Max, MaxLength } from 'class-validator';

export class CreateBidDto {
  @ApiProperty({ example: 1500.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(1_000_000)
  proposedPrice: number;

  @ApiPropertyOptional({ example: 'I can deliver within 3 days.' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  message?: string;
}
