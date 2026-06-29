import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BidStatus } from '../entities/bid.entity';

export class BidResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'shipment-uuid' })
  shipmentId: string;

  @ApiProperty({ example: 'carrier-uuid' })
  carrierId: string;

  @ApiProperty({ example: 1500.0 })
  proposedPrice: number;

  @ApiPropertyOptional({
    example: 'I can deliver within 3 days.',
    nullable: true,
  })
  message: string | null;

  @ApiProperty({ enum: BidStatus, example: BidStatus.PENDING })
  status: BidStatus;

  @ApiPropertyOptional({ example: 1200.0, nullable: true })
  counterPrice: number | null;

  @ApiPropertyOptional({
    example: 'We can meet in the middle.',
    nullable: true,
  })
  counterMessage: string | null;

  @ApiPropertyOptional({ nullable: true })
  expiresAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}
