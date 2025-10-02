import { IsNumber, IsUUID } from 'class-validator';

export class UpdateShipmentLocationDto {
  @IsUUID()
  shipmentId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
