import { IsString, IsUUID, IsEnum, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { VehicleType } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @IsString()
  carrierId: string;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsString()
  licensePlate: string;

  @IsNumber()
  @IsOptional()
  capacityWeight?: number;

  @IsNumber()
  @IsOptional()
  capacityVolume?: number;

  @IsNumber()
  @Min(1900)
  @Max(2030)
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  make?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}