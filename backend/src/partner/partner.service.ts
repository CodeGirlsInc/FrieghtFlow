import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Partner } from './entities/partner.entity';
import { Repository } from 'typeorm';
import { CreatePartnerDto } from './Dto/create-partner.dto';
import { FilterPartnerDto } from './dto/filter-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
// import { FilterPartnerDto } from './dto/filter-partner.dto';
// import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
  ) {}

  async create(dto: CreatePartnerDto): Promise<Partner> {
    const partner = this.partnerRepo.create(dto);
    return this.partnerRepo.save(partner);
  }

  async findAll(filter: FilterPartnerDto): Promise<Partner[]> {
    const query = this.partnerRepo.createQueryBuilder('partner');

    if (filter.serviceType) {
      query.andWhere(":serviceType = ANY (string_to_array(partner.serviceTypes, ','))", {
        serviceType: filter.serviceType,
      });
    }

    if (filter.rating) {
      query.andWhere('partner.rating >= :rating', { rating: filter.rating });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Partner> {
    const partner = await this.partnerRepo.findOne({ where: { id } });
    if (!partner) throw new NotFoundException(`Partner ${id} not found`);
    return partner;
  }

  async update(id: string, dto: UpdatePartnerDto): Promise<Partner> {
    await this.findOne(id); // ensure exists
    await this.partnerRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.partnerRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Partner ${id} not found`);
    }
  }
}
