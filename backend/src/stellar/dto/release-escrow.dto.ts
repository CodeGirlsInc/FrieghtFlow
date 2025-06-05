import { IsString, IsNotEmpty } from "class-validator"

export class ReleaseEscrowDto {
  @IsString()
  @IsNotEmpty()
  escrowId: string

  @IsString()
  @IsNotEmpty()
  releaseSecretKey: string // Could be source or authorized releaser
}
