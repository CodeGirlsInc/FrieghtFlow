import { PartialType } from '@nestjs/swagger';
import { CreateInsurancePolicyDto } from './create-insurance-policy.dto';

export class UpdateInsurancePolicyDto extends PartialType(CreateInsurancePolicyDto) {}
