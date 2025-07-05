import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsNumber,
  IsObject,
  ValidateIf,
  IsNotEmpty,
  Min,
  Max,
  Length,
  IsUrl,
  IsIP,
} from "class-validator"
import { Transform, Type } from "class-transformer"
import { ProofType } from "../entities/delivery-proof.entity"

export class CreateDeliveryProofDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  deliveryId: string

  @IsEnum(ProofType)
  proofType: ProofType

  @ValidateIf((o) => o.proofType === ProofType.SIGNATURE)
  @IsString()
  @IsNotEmpty()
  signature?: string

  @ValidateIf((o) => o.proofType === ProofType.PHOTO)
  @IsUrl()
  @IsNotEmpty()
  photoUrl?: string

  @ValidateIf((o) => o.proofType === ProofType.TOKEN)
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  token?: string

  @ValidateIf((o) => o.proofType === ProofType.QR_CODE)
  @IsString()
  @IsNotEmpty()
  qrData?: string

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @IsOptional()
  @IsString()
  @Length(1, 255)
  recipientName?: string

  @IsOptional()
  @IsEmail()
  recipientEmail?: string

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number

  @IsOptional()
  @IsObject()
  deviceInfo?: Record<string, any>

  @IsOptional()
  @IsIP()
  ipAddress?: string

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  expiresAt?: Date
}
