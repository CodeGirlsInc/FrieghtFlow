// dto/update-customs-document.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateCustomsDocumentDto {
  @IsOptional()
  @IsString()
  status?: string;
}
