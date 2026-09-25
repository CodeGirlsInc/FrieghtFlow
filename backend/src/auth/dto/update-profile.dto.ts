import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsStellarEd25519PublicKey } from '../../common/validators/is-stellar-ed25519-public-key.decorator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    example: 'GAGD6MFNQ5IZQQQW6MOS6JWZALYR5P7ITCZP3NUQPNYLHWYBQVC6NNXB',
    description: 'Optional Stellar Ed25519 account public key (StrKey)',
  })
  @IsOptional()
  @IsString()
  @IsStellarEd25519PublicKey()
  walletAddress?: string | null;
}
