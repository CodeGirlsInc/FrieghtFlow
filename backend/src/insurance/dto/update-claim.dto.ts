import { PartialType } from '@nestjs/swagger';
import { CreateClaimDto } from './create-claim.dto';

export class UpdateClaimDto extends PartialType(CreateClaimDto) {}
