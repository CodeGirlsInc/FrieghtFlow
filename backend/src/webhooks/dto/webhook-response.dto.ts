import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebhookResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'user-uuid' })
  userId: string;

  @ApiProperty({ example: 'https://partner.example.com/webhooks/freightflow' })
  url: string;

  @ApiPropertyOptional({ type: [String], example: ['shipment.status_changed'] })
  events: string[] | null;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiPropertyOptional({ nullable: true })
  lastDeliveryStatus: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastDeliveryAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}
