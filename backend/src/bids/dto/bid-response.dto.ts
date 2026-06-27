import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BidStatus } from '../entities/bid.entity';

export class BidResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  shipmentId: string;

  @ApiProperty({ format: 'uuid' })
  carrierId: string;

  @ApiProperty({ type: Number })
  proposedPrice: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  message: string | null;

  @ApiProperty({ enum: Object.values(BidStatus), enumName: 'BidStatus' })
  status: string;

  @ApiPropertyOptional({ type: Number, nullable: true })
  counterPrice: number | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  counterMessage: string | null;

  @ApiPropertyOptional({ type: Date, nullable: true })
  expiresAt: Date | null;

  @ApiPropertyOptional({ type: Date, nullable: true })
  counterOfferedAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}
