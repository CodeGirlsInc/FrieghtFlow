import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  shipmentId: string;

  @ApiProperty({ format: 'uuid' })
  reviewerId: string;

  @ApiProperty({ format: 'uuid' })
  revieweeId: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  rating: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  comment: string | null;

  @ApiProperty()
  createdAt: Date;
}
