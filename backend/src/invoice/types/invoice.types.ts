export interface BusinessInfo {
  name: string
  address: string
  phone: string
  email: string
  website?: string
  taxId?: string
  logo?: string
}

export interface CustomerInfo {
  name: string
  email: string
  address?: string
  phone?: string
  taxId?: string
}

export interface InvoiceItemData {
  description: string
  quantity: number
  unitPrice: number
  taxRate?: number
  discount?: number
}

export interface InvoiceMetadata {
  transactionId?: string
  orderId?: string
  shipmentId?: string
  paymentMethod?: string
  notes?: string
  customFields?: Record<string, any>
}

export interface InvoiceTotals {
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
}

export interface InvoiceData {
  customer: CustomerInfo
  items: InvoiceItemData[]
  metadata?: InvoiceMetadata
  dueDate?: Date
  issueDate?: Date
  currency?: string
  paymentTerms?: string
  notes?: string
}

export enum InvoiceStatus {
  DRAFT = "draft",
  SENT = "sent",
  PAID = "paid",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  PAID = "paid",
  REFUNDED = "refunded",
}

export interface EmailDeliveryOptions {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject?: string
  message?: string
  attachPdf?: boolean
}

export interface PdfGenerationOptions {
  template?: string
  includeWatermark?: boolean
  watermarkText?: string
  pageSize?: "A4" | "Letter"
  margins?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}
