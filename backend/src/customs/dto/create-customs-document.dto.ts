// dto/create-customs-document.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCustomsDocumentDto {
  @IsNotEmpty()
  @IsString()
  shipmentId: string;

  @IsNotEmpty()
  @IsString()
  documentType: string;

  @IsNotEmpty()
  @IsString()
  fileUrl: string;
}
