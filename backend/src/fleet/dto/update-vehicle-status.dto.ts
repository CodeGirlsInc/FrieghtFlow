import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { VehicleStatus } from './create-vehicle.dto';

export class UpdateVehicleStatusDto {
  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}