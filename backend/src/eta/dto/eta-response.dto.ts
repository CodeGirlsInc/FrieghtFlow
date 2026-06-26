import { ApiProperty } from '@nestjs/swagger';

export class ETAResponseDto {
  @ApiProperty({ example: 12.5 })
  estimatedHours: number;

  @ApiProperty({ example: '2026-06-27T02:30:00.000Z' })
  estimatedDeliveryDate: string;

  @ApiProperty({ example: 'medium', enum: ['high', 'medium', 'low'] })
  confidenceLevel: string;
}
