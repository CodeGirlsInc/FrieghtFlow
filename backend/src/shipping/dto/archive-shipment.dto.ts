import { IsString, IsNotEmpty, IsOptional } from "class-validator"

export class ArchiveShipmentDto {
  @IsString()
  @IsNotEmpty()
  archivedBy: string

  @IsString()
  @IsOptional()
  archiveReason?: string
}
