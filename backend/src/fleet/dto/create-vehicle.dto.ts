import { IsString, IsEnum, IsNumber, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export enum VehicleType {
  TRUCK = 'TRUCK',
  SHIP = 'SHIP',
  PLANE = 'PLANE'
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_TRANSIT = 'IN_TRANSIT',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  carrierId: string;

  @IsEnum(VehicleType)
  type: VehicleType;

  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  year: number;

  @IsNumber()
  capacityWeight: number; // in kg

  @IsNumber()
  capacityVolume: number; // in cubic meters

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}