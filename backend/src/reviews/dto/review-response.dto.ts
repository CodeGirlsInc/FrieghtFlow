import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'shipment-uuid' })
  shipmentId: string;

  @ApiProperty({ example: 'reviewer-uuid' })
  reviewerId: string;

  @ApiProperty({ example: 'reviewee-uuid' })
  revieweeId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  rating: number;

  @ApiPropertyOptional({ example: 'Excellent service!', nullable: true })
  comment: string | null;

  @ApiProperty()
  createdAt: Date;
}
