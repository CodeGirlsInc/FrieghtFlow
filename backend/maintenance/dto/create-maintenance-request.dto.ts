import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { MaintenancePriority } from '../entities/maintenance-request.entity';

export class CreateMaintenanceRequestDto {
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(MaintenancePriority)
  priority: MaintenancePriority;

  @IsString()
  @IsOptional()
  assignedTechnician?: string;
}