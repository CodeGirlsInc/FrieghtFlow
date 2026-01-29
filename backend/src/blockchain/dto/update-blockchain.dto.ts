import { PartialType } from '@nestjs/mapped-types';
import { CreateBlockchainDto } from './create-blockchain.dto';

export class UpdateBlockchainDto extends PartialType(CreateBlockchainDto) {}
