import { IsEnum, IsOptional, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export enum UploadType {
  PROOF = "proof",
  KYC = "kyc",
  SHIPMENT = "shipment",
  ID = "id",
  GENERAL = "general",
}

export class UploadDto {
  @ApiProperty({
    enum: UploadType,
    description: "Type of upload",
    example: UploadType.PROOF,
  })
  @IsEnum(UploadType)
  uploadType: UploadType

  @ApiProperty({
    description: "Optional description for the upload",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    description: "Reference ID (e.g., order ID, user ID)",
    required: false,
  })
  @IsOptional()
  @IsString()
  referenceId?: string
}

export class UploadResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  filename: string

  @ApiProperty()
  originalName: string

  @ApiProperty()
  mimetype: string

  @ApiProperty()
  size: number

  @ApiProperty()
  path: string

  @ApiProperty()
  uploadType: UploadType

  @ApiProperty()
  uploadedAt: Date

  @ApiProperty({ required: false })
  description?: string

  @ApiProperty({ required: false })
  referenceId?: string
}
