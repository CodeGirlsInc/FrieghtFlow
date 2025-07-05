import { PartialType } from "@nestjs/mapped-types"
import { IsEnum, IsOptional, IsString, Length } from "class-validator"
import { CreateDeliveryProofDto } from "./create-delivery-proof.dto"
import { ProofStatus } from "../entities/delivery-proof.entity"

export class UpdateDeliveryProofDto extends PartialType(CreateDeliveryProofDto) {
  @IsOptional()
  @IsEnum(ProofStatus)
  status?: ProofStatus

  @IsOptional()
  @IsString()
  @Length(1, 66)
  blockchainTxHash?: string

  @IsOptional()
  @IsString()
  blockchainBlockNumber?: string

  @IsOptional()
  @IsString()
  lastError?: string
}
