import { IsNotEmpty, IsString, IsArray, IsUrl, ValidateNested, IsIn, IsOptional } from "class-validator"
import { Type } from "class-transformer"

class DocumentDto {
  @IsNotEmpty()
  @IsString()
  type: string

  @IsNotEmpty()
  @IsUrl()
  url: string

  @IsOptional()
  @IsString()
  @IsIn(["pending", "verified", "rejected"])
  status?: "pending" | "verified" | "rejected"
}

export class CreateVerificationDto {
  @IsNotEmpty()
  @IsString()
  businessId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents: DocumentDto[]
}
