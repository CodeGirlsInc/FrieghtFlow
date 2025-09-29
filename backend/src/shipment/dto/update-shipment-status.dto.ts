import { IsString, IsNotEmpty, IsOptional, IsEnum, Length } from "class-validator";
import { ShipmentStatus } from "../shipment.entity";

export class UpdateShipmentStatusDto {
  @IsEnum(ShipmentStatus)
  @IsNotEmpty()
  status: ShipmentStatus;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  location?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string;
}
