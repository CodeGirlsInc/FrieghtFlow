import { Injectable } from "@nestjs/common"
import type { InvoiceConfigService } from "../config/invoice-config.service"
import type { InvoiceData, InvoiceTotals, InvoiceItemData } from "../types/invoice.types"

@Injectable()
export class InvoiceTemplateService {
  constructor(private readonly configService: InvoiceConfigService) {}

  calculateInvoiceTotals(items: InvoiceItemData[]): InvoiceTotals {
    let subtotal = 0
    let taxAmount = 0
    let discountAmount = 0

    for (const item of items) {
      const lineSubtotal = item.quantity * item.unitPrice
      const lineDiscount = item.discount || 0
      const lineAfterDiscount = lineSubtotal - lineDiscount
      const lineTax = lineAfterDiscount * (item.taxRate || 0)

      subtotal += lineSubtotal
      discountAmount += lineDiscount
      taxAmount += lineTax
    }

    const total = subtotal - discountAmount + taxAmount

    return {
      subtotal,
      taxAmount,
      discountAmount,
      total,
    }
  }

  generateInvoiceNumber(): string {
    const prefix = this.configService.invoicePrefix
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }

  calculateDueDate(issueDate: Date, dueDays?: number): Date {
    const dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + (dueDays || this.configService.dueDays))
    return dueDate
  }

  validateInvoiceData(data: InvoiceData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate customer
    if (!data.customer.name?.trim()) {
      errors.push("Customer name is required")
    }

    if (!data.customer.email?.trim()) {
      errors.push("Customer email is required")
    } else if (!this.isValidEmail(data.customer.email)) {
      errors.push("Customer email is invalid")
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      errors.push("At least one invoice item is required")
    } else {
      data.items.forEach((item, index) => {
        if (!item.description?.trim()) {
          errors.push(`Item ${index + 1}: Description is required`)
        }

        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`)
        }

        if (!item.unitPrice || item.unitPrice < 0) {
          errors.push(`Item ${index + 1}: Unit price must be 0 or greater`)
        }

        if (item.taxRate && (item.taxRate < 0 || item.taxRate > 1)) {
          errors.push(`Item ${index + 1}: Tax rate must be between 0 and 1`)
        }

        if (item.discount && item.discount < 0) {
          errors.push(`Item ${index + 1}: Discount cannot be negative`)
        }
      })
    }

    // Validate dates
    if (data.issueDate && data.dueDate && data.dueDate < data.issueDate) {
      errors.push("Due date cannot be before issue date")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  formatCurrency(amount: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  generateInvoicePreview(data: InvoiceData): any {
    const totals = this.calculateInvoiceTotals(data.items)
    const issueDate = data.issueDate || new Date()
    const dueDate = data.dueDate || this.calculateDueDate(issueDate)

    return {
      invoiceNumber: "PREVIEW",
      customer: data.customer,
      items: data.items.map((item) => ({
        ...item,
        lineTotal: item.quantity * item.unitPrice - (item.discount || 0),
      })),
      issueDate,
      dueDate,
      currency: data.currency || this.configService.defaultCurrency,
      paymentTerms: data.paymentTerms || this.configService.paymentTerms,
      notes: data.notes,
      metadata: data.metadata,
      ...totals,
      balanceDue: totals.total,
    }
  }
}
