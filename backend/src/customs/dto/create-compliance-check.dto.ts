// dto/create-compliance-check.dto.ts
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateComplianceCheckDto {
  @IsNotEmpty()
  @IsString()
  shipmentId: string;

  @IsNotEmpty()
  @IsString()
  checkType: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
