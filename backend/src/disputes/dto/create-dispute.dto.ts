import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateDisputeDto {
  @ApiProperty()
  @IsUUID()
  shipmentId: string;

  @ApiProperty({ example: 'Carrier did not deliver on time' })
  @IsString()
  reason: string;
}
