import { IsEnum, IsUUID } from 'class-validator';
import { ShipmentStatus } from '../entities/shipment.entity';

export class UpdateShipmentStatusDto {
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @IsUUID()
  locationId: string;
}
