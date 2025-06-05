import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { InvoiceItem } from "../entities/invoice-item.entity"

@Injectable()
export class InvoiceItemRepository {
  constructor(private readonly repository: Repository<InvoiceItem>) {}

  async create(itemData: Partial<InvoiceItem>): Promise<InvoiceItem> {
    const item = this.repository.create(itemData)
    return this.repository.save(item)
  }

  async createMany(itemsData: Partial<InvoiceItem>[]): Promise<InvoiceItem[]> {
    const items = this.repository.create(itemsData)
    return this.repository.save(items)
  }

  async findByInvoiceId(invoiceId: string): Promise<InvoiceItem[]> {
    return this.repository.find({
      where: { invoiceId },
      order: { id: "ASC" },
    })
  }

  async deleteByInvoiceId(invoiceId: string): Promise<void> {
    await this.repository.delete({ invoiceId })
  }

  async update(id: string, updateData: Partial<InvoiceItem>): Promise<void> {
    await this.repository.update(id, updateData)
  }
}
