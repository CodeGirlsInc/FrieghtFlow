import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { DisputeStatus } from '../entities/dispute.entity';

export class UpdateDisputeStatusDto {
  @IsEnum(DisputeStatus)
  status: DisputeStatus;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  resolutionNotes?: string;
}