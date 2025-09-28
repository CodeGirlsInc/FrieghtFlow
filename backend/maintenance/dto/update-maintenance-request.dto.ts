import { IsString, IsEnum, IsOptional } from 'class-validator';
import { MaintenancePriority, MaintenanceStatus } from '../entities/maintenance-request.entity';

export class UpdateMaintenanceRequestDto {
  @IsEnum(MaintenancePriority)
  @IsOptional()
  priority?: MaintenancePriority;

  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @IsString()
  @IsOptional()
  assignedTechnician?: string;

  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}