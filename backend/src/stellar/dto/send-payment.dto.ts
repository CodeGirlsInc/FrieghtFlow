import { IsString, IsNotEmpty, IsOptional, IsNumberString, IsEnum } from "class-validator"
import { AssetType } from "../types/stellar.types"

export class SendPaymentDto {
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

  @IsOptional()
  @IsString()
  memo?: string
}
