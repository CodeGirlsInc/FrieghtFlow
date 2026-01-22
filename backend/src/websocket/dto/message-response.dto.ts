import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ description: 'Message ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Freight job ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  freightJobId: string;

  @ApiProperty({ description: 'Sender ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  senderId: string;

  @ApiProperty({ description: 'Message content', example: 'Hello, when will the shipment arrive?' })
  messageContent: string;

  @ApiProperty({ description: 'Is message read', example: false })
  isRead: boolean;

  @ApiProperty({ description: 'Sent timestamp', example: '2024-01-01T00:00:00.000Z' })
  sentAt: Date;
}

