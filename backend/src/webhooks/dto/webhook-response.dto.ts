import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebhookResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ example: 'https://example.com/webhook' })
  url: string;

  @ApiPropertyOptional({ type: [String], nullable: true })
  events: string[] | null;

  @ApiProperty()
  active: boolean;

  @ApiPropertyOptional({ type: String, nullable: true })
  lastDeliveryStatus: string | null;

  @ApiPropertyOptional({ type: Date, nullable: true })
  lastDeliveryAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}
