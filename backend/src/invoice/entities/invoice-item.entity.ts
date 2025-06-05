import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Invoice } from "./invoice.entity"

@Entity("invoice_items")
export class InvoiceItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  invoiceId: string

  @Column()
  description: string

  @Column("decimal", { precision: 10, scale: 2 })
  quantity: number

  @Column("decimal", { precision: 10, scale: 2 })
  unitPrice: number

  @Column("decimal", { precision: 5, scale: 4, default: 0 })
  taxRate: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  discount: number

  @Column("decimal", { precision: 10, scale: 2 })
  lineTotal: number

  @Column({ nullable: true })
  productId: string

  @Column({ nullable: true })
  sku: string

  @ManyToOne(
    () => Invoice,
    (invoice) => invoice.items,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "invoiceId" })
  invoice: Invoice
}
