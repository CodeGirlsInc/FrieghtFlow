import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoicesRepository: Repository<Invoice>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = this.invoicesRepository.create(createInvoiceDto);
    return this.invoicesRepository.save(invoice);
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOneBy({ id });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID "${id}" not found`);
    }
    return invoice;
  }

  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.findOne(id);
    Object.assign(invoice, updateInvoiceDto);
    return this.invoicesRepository.save(invoice);
  }
}
