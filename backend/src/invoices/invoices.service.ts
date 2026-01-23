import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  async generate(freightJobId: string, amount: number) {
    const invoice = this.invoiceRepo.create({
      freightJobId,
      invoiceNumber: `INV-${Date.now()}`,
      amount,
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return this.invoiceRepo.save(invoice);
  }

  async findOne(id: string) {
    return this.invoiceRepo.findOne({ where: { id } });
  }
}
