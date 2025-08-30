// src/invoice/invoice.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Invoice, PaymentStatus } from "./invoice.entity";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { generateInvoicePdf } from "./invoice-pdf.util";

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly repo: Repository<Invoice>
  ) {}

  async create(createDto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = this.repo.create({
      customerId: createDto.customerId,
      amount: createDto.amount,
      currency: createDto.currency ?? "USD",
      dueDate: new Date(createDto.dueDate),
      paymentStatus: PaymentStatus.PENDING,
    });

    const saved = await this.repo.save(invoice);

    // generate pdf & save URL
    try {
      const pdfUrl = await generateInvoicePdf(saved);
      saved.pdfUrl = pdfUrl;
      await this.repo.save(saved);
    } catch (err) {
      // keep invoice, but log/give error
      // you can extend with a retry or background job
      throw new InternalServerErrorException("Failed to generate invoice PDF");
    }

    return saved;
  }

  async findOne(id: string): Promise<Invoice> {
    const inv = await this.repo.findOne({ where: { id } });
    if (!inv) throw new NotFoundException("Invoice not found");
    return inv;
  }

  async markAsPaid(id: string): Promise<Invoice> {
    const inv = await this.findOne(id);
    inv.paymentStatus = PaymentStatus.PAID;
    return this.repo.save(inv);
  }

  async findAll(): Promise<Invoice[]> {
    return this.repo.find({ order: { createdAt: "DESC" } });
  }
}
