import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly repo: Repository<PaymentMethod>,
  ) {}

  create(dto: any) {
    return this.repo.save(dto);
  }

  findAll(userId: string) {
    return this.repo.find({ where: { userId, isActive: true } });
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
