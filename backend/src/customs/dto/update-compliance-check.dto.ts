// dto/update-compliance-check.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateComplianceCheckDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
