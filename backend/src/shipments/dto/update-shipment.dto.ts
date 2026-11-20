import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateShipmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Pickup date (ISO 8601). Must be in the future.',
  })
  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @ApiPropertyOptional({
    description:
      'Estimated delivery date (ISO 8601). Must be on or after pickupDate.',
  })
  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;
}
