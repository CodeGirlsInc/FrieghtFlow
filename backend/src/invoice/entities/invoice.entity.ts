import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from "typeorm"
import { InvoiceItem } from "./invoice-item.entity"
import { InvoiceStatus, PaymentStatus } from "../types/invoice.types"

@Entity("invoices")
export class Invoice {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  @Index()
  invoiceNumber: string

  @Column({
    type: "enum",
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  @Index()
  status: InvoiceStatus

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @Index()
  paymentStatus: PaymentStatus

  // Customer Information
  @Column()
  customerName: string

  @Column()
  customerEmail: string

  @Column({ nullable: true })
  customerAddress: string

  @Column({ nullable: true })
  customerPhone: string

  @Column({ nullable: true })
  customerTaxId: string

  // Invoice Details
  @Column({ type: "date" })
  issueDate: Date

  @Column({ type: "date" })
  dueDate: Date

  @Column({ default: "USD" })
  currency: string

  @Column({ nullable: true })
  paymentTerms: string

  @Column("text", { nullable: true })
  notes: string

  // Financial Information
  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  subtotal: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  taxAmount: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  discountAmount: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  total: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  paidAmount: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  balanceDue: number

  // Metadata
  @Column("jsonb", { nullable: true })
  metadata: Record<string, any>

  @Column({ nullable: true })
  transactionId: string

  @Column({ nullable: true })
  orderId: string

  @Column({ nullable: true })
  shipmentId: string

  @Column({ nullable: true })
  paymentMethod: string

  // File Information
  @Column({ nullable: true })
  pdfPath: string

  @Column({ nullable: true })
  pdfUrl: string

  @Column({ default: false })
  emailSent: boolean

  @Column({ nullable: true })
  emailSentAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(
    () => InvoiceItem,
    (item) => item.invoice,
    { cascade: true },
  )
  items: InvoiceItem[]
}
