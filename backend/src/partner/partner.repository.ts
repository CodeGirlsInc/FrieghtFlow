import { EntityRepository, Repository } from 'typeorm';
import { Partner } from './entities/partner.entity';

@EntityRepository(Partner)
export class PartnerRepository extends Repository<Partner> {}
