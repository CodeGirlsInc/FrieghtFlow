import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Invoice } from "../entities/invoice.entity"
import { InvoiceStatus, PaymentStatus } from "../types/invoice.types"

@Injectable()
export class InvoiceRepository {
  constructor(private readonly repository: Repository<Invoice>) {}

  async create(invoiceData: Partial<Invoice>): Promise<Invoice> {
    const invoice = this.repository.create(invoiceData)
    return this.repository.save(invoice)
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["items"],
    })
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    return this.repository.findOne({
      where: { invoiceNumber },
      relations: ["items"],
    })
  }

  async findByCustomerEmail(customerEmail: string): Promise<Invoice[]> {
    return this.repository.find({
      where: { customerEmail },
      relations: ["items"],
      order: { createdAt: "DESC" },
    })
  }

  async findByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    return this.repository.find({
      where: { status },
      relations: ["items"],
      order: { createdAt: "DESC" },
    })
  }

  async findOverdueInvoices(): Promise<Invoice[]> {
    const today = new Date()
    return this.repository
      .createQueryBuilder("invoice")
      .leftJoinAndSelect("invoice.items", "items")
      .where("invoice.dueDate < :today", { today })
      .andWhere("invoice.paymentStatus != :paid", { paid: PaymentStatus.PAID })
      .andWhere("invoice.status != :cancelled", { cancelled: InvoiceStatus.CANCELLED })
      .orderBy("invoice.dueDate", "ASC")
      .getMany()
  }

  async findAll(page = 1, limit = 50): Promise<{ invoices: Invoice[]; total: number }> {
    const [invoices, total] = await this.repository.findAndCount({
      relations: ["items"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    })

    return { invoices, total }
  }

  async update(id: string, updateData: Partial<Invoice>): Promise<void> {
    await this.repository.update(id, updateData)
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<void> {
    await this.repository.update(id, { status })
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, paidAmount?: number): Promise<void> {
    const updateData: any = { paymentStatus }
    if (paidAmount !== undefined) {
      updateData.paidAmount = paidAmount
    }
    await this.repository.update(id, updateData)
  }

  async markEmailSent(id: string): Promise<void> {
    await this.repository.update(id, {
      emailSent: true,
      emailSentAt: new Date(),
    })
  }

  async getNextInvoiceNumber(prefix: string): Promise<string> {
    const lastInvoice = await this.repository
      .createQueryBuilder("invoice")
      .where("invoice.invoiceNumber LIKE :prefix", { prefix: `${prefix}%` })
      .orderBy("invoice.invoiceNumber", "DESC")
      .getOne()

    if (!lastInvoice) {
      return `${prefix}-000001`
    }

    const lastNumber = lastInvoice.invoiceNumber.split("-").pop()
    const nextNumber = (Number.parseInt(lastNumber || "0") + 1).toString().padStart(6, "0")
    return `${prefix}-${nextNumber}`
  }

  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    const query = this.repository
      .createQueryBuilder("invoice")
      .select("SUM(invoice.total)", "total")
      .where("invoice.paymentStatus = :paid", { paid: PaymentStatus.PAID })

    if (startDate) {
      query.andWhere("invoice.issueDate >= :startDate", { startDate })
    }

    if (endDate) {
      query.andWhere("invoice.issueDate <= :endDate", { endDate })
    }

    const result = await query.getRawOne()
    return Number.parseFloat(result.total) || 0
  }
}
