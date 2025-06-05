import { IsString, IsNotEmpty, IsOptional, IsNumberString, IsEnum, IsArray, IsDateString } from "class-validator"
import { AssetType } from "../types/stellar.types"

export class CreateEscrowDto {
  @IsString()
  @IsNotEmpty()
  sourceSecretKey: string

  @IsString()
  @IsNotEmpty()
  destinationPublicKey: string

  @IsNumberString()
  @IsNotEmpty()
  amount: string

  @IsOptional()
  @IsEnum(AssetType)
  assetType?: AssetType

  @IsOptional()
  @IsString()
  assetCode?: string

  @IsOptional()
  @IsString()
  assetIssuer?: string

  @IsArray()
  @IsString({ each: true })
  releaseConditions: string[]

  @IsOptional()
  @IsString()
  memo?: string

  @IsOptional()
  @IsDateString()
  expiresAt?: string
}
