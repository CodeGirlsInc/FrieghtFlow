import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID, ArrayMaxSize, ArrayMinSize, IsEnum } from 'class-validator';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';

export class BulkCancelDto {
  @ApiProperty({ description: 'Array of shipment IDs to cancel', maxLength: 50 })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];
}

export class BulkUpdateStatusDto {
  @ApiProperty({ description: 'Array of shipment IDs to update', maxLength: 50 })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  ids: string[];

  @ApiProperty({ enum: ShipmentStatus })
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;
}
