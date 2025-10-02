import { IsUUID, IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrackingEventDto {
  @ApiProperty({ description: 'Shipment ID to attach this tracking event to', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  shipmentId: string;

  @ApiProperty({ description: 'Checkpoint location', example: 'Los Angeles Hub' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  location: string;

  @ApiProperty({ description: 'Status update message', example: 'In transit' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  statusUpdate: string;
}
