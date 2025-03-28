import { Injectable } from '@nestjs/common';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';

@Injectable()
export class PricingService {
  create(createPricingDto: CreatePricingDto) {
    return 'This action adds a new pricing';
  }

  findAll() {
    return `This action returns all pricing`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pricing`;
  }

  update(id: number, updatePricingDto: UpdatePricingDto) {
    return `This action updates a #${id} pricing`;
  }

  remove(id: number) {
    return `This action removes a #${id} pricing`;
  }
}
