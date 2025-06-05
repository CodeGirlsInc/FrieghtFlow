import { Injectable, Logger, BadRequestException, NotFoundException } from "@nestjs/common"
import { v4 as uuidv4 } from "uuid"
import type { InvoiceConfigService } from "./config/invoice-config.service"
import type { InvoiceRepository } from "./repositories/invoice.repository"
import type { InvoiceItemRepository } from "./repositories/invoice-item.repository"
import type { PdfGeneratorService } from "./services/pdf-generator.service"
import type { EmailService } from "./services/email.service"
import type { InvoiceTemplateService } from "./services/invoice-template.service"
import type { InvoiceData, EmailDeliveryOptions, PdfGenerationOptions } from "./types/invoice.types"
import { InvoiceStatus, PaymentStatus } from "./types/invoice.types"
import type { Invoice } from "./entities/invoice.entity"

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name)

  constructor(
    private readonly configService: InvoiceConfigService,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceItemRepository: InvoiceItemRepository,
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly emailService: EmailService,
    private readonly templateService: InvoiceTemplateService,
  ) {}

  async createInvoice(invoiceData: InvoiceData): Promise<Invoice> {
    // Validate invoice data
    const validation = this.templateService.validateInvoiceData(invoiceData)
    if (!validation.isValid) {
      throw new BadRequestException(`Invalid invoice data: ${validation.errors.join(", ")}`)
    }

    try {
      // Calculate totals
      const totals = this.templateService.calculateInvoiceTotals(invoiceData.items)

      // Generate invoice number
      const invoiceNumber = await this.invoiceRepository.getNextInvoiceNumber(this.configService.invoicePrefix)

      // Set dates
      const issueDate = invoiceData.issueDate || new Date()
      const dueDate = invoiceData.dueDate || this.templateService.calculateDueDate(issueDate)

      // Create invoice
      const invoice = await this.invoiceRepository.create({
        id: uuidv4(),
        invoiceNumber,
        customerName: invoiceData.customer.name,
        customerEmail: invoiceData.customer.email,
        customerAddress: invoiceData.customer.address,
        customerPhone: invoiceData.customer.phone,
        customerTaxId: invoiceData.customer.taxId,
        issueDate,
        dueDate,
        currency: invoiceData.currency || this.configService.defaultCurrency,
        paymentTerms: invoiceData.paymentTerms || this.configService.paymentTerms,
        notes: invoiceData.notes,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        discountAmount: totals.discountAmount,
        total: totals.total,
        balanceDue: totals.total,
        metadata: invoiceData.metadata,
        transactionId: invoiceData.metadata?.transactionId,
        orderId: invoiceData.metadata?.orderId,
        shipmentId: invoiceData.metadata?.shipmentId,
        paymentMethod: invoiceData.metadata?.paymentMethod,
        status: InvoiceStatus.DRAFT,
        paymentStatus: PaymentStatus.PENDING,
      })

      // Create invoice items
      const items = invoiceData.items.map((item) => ({
        id: uuidv4(),
        invoiceId: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate || 0,
        discount: item.discount || 0,
        lineTotal: item.quantity * item.unitPrice - (item.discount || 0),
      }))

      await this.invoiceItemRepository.createMany(items)

      // Load complete invoice with items
      const completeInvoice = await this.invoiceRepository.findById(invoice.id)
      this.logger.log(`Invoice created: ${invoice.invoiceNumber}`)

      return completeInvoice!
    } catch (error) {
      this.logger.error("Failed to create invoice", error)
      throw new BadRequestException(`Failed to create invoice: ${error.message}`)
    }
  }

  async generateInvoicePdf(
    invoiceId: string,
    options: PdfGenerationOptions = {},
  ): Promise<{ invoice: Invoice; pdfBuffer: Buffer; filePath?: string }> {
    const invoice = await this.invoiceRepository.findById(invoiceId)
    if (!invoice) {
      throw new NotFoundException("Invoice not found")
    }

    try {
      // Generate PDF
      const pdfBuffer = await this.pdfGeneratorService.generateInvoicePdf(invoice, options)

      // Save PDF if storage is enabled
      let filePath: string | undefined
      if (this.configService.enablePdfStorage) {
        filePath = await this.pdfGeneratorService.saveInvoicePdf(invoice, pdfBuffer)
        await this.invoiceRepository.update(invoice.id, { pdfPath: filePath })
      }

      this.logger.log(`PDF generated for invoice: ${invoice.invoiceNumber}`)

      return { invoice, pdfBuffer, filePath }
    } catch (error) {
      this.logger.error("Failed to generate PDF", error)
      throw new BadRequestException(`Failed to generate PDF: ${error.message}`)
    }
  }

  async sendInvoiceEmail(
    invoiceId: string,
    emailOptions: EmailDeliveryOptions,
    pdfOptions: PdfGenerationOptions = {},
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const invoice = await this.invoiceRepository.findById(invoiceId)
    if (!invoice) {
      throw new NotFoundException("Invoice not found")
    }

    try {
      // Generate PDF for email attachment
      const { pdfBuffer } = await this.generateInvoicePdf(invoiceId, pdfOptions)

      // Send email
      const result = await this.emailService.sendInvoiceEmail(invoice, pdfBuffer, emailOptions)

      // Update invoice status if email was sent successfully
      if (result.success) {
        await this.invoiceRepository.markEmailSent(invoice.id)
        await this.invoiceRepository.updateStatus(invoice.id, InvoiceStatus.SENT)
      }

      this.logger.log(`Invoice email ${result.success ? "sent" : "failed"}: ${invoice.invoiceNumber}`)

      return result
    } catch (error) {
      this.logger.error("Failed to send invoice email", error)
      return { success: false, error: error.message }
    }
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId)
    if (!invoice) {
      throw new NotFoundException("Invoice not found")
    }
    return invoice
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findByInvoiceNumber(invoiceNumber)
    if (!invoice) {
      throw new NotFoundException("Invoice not found")
    }
    return invoice
  }

  async getCustomerInvoices(customerEmail: string): Promise<Invoice[]> {
    return this.invoiceRepository.findByCustomerEmail(customerEmail)
  }

  async getAllInvoices(page = 1, limit = 50): Promise<{ invoices: Invoice[]; total: number; totalPages: number }> {
    const { invoices, total } = await this.invoiceRepository.findAll(page, limit)
    const totalPages = Math.ceil(total / limit)

    return { invoices, total, totalPages }
  }

  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId)
    if (!invoice) {
      throw new NotFoundException("Invoice not found")
    }

    await this.invoiceRepository.updateStatus(invoiceId, status)
    this.logger.log(`Invoice status updated: ${invoice.invoiceNumber} -> ${status}`)

    return this.invoiceRepository.findById(invoiceId)!
  }

  async updatePaymentStatus(invoiceId: string, paymentStatus: PaymentStatus, paidAmount?: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId)
    if (!invoice) {
      throw new NotFoundException("Invoice not found")
    }

    const updateData: any = { paymentStatus }

    if (paidAmount !== undefined) {
      updateData.paidAmount = paidAmount
      updateData.balanceDue = invoice.total - paidAmount

      // Auto-update invoice status based on payment
      if (paidAmount >= invoice.total) {
        updateData.paymentStatus = PaymentStatus.PAID
        await this.invoiceRepository.updateStatus(invoiceId, InvoiceStatus.PAID)
      } else if (paidAmount > 0) {
        updateData.paymentStatus = PaymentStatus.PARTIAL
      }
    }

    await this.invoiceRepository.update(invoiceId, updateData)
    this.logger.log(`Payment status updated: ${invoice.invoiceNumber} -> ${paymentStatus}`)

    return this.invoiceRepository.findById(invoiceId)!
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    const overdueInvoices = await this.invoiceRepository.findOverdueInvoices()

    // Update status to overdue if not already set
    for (const invoice of overdueInvoices) {
      if (invoice.status !== InvoiceStatus.OVERDUE) {
        await this.invoiceRepository.updateStatus(invoice.id, InvoiceStatus.OVERDUE)
      }
    }

    return overdueInvoices
  }

  async sendPaymentReminders(): Promise<{ sent: number; failed: number }> {
    const overdueInvoices = await this.getOverdueInvoices()
    let sent = 0
    let failed = 0

    for (const invoice of overdueInvoices) {
      try {
        const result = await this.emailService.sendPaymentReminderEmail(invoice)
        if (result.success) {
          sent++
        } else {
          failed++
        }
      } catch (error) {
        this.logger.error(`Failed to send reminder for invoice ${invoice.invoiceNumber}`, error)
        failed++
      }
    }

    this.logger.log(`Payment reminders sent: ${sent} successful, ${failed} failed`)
    return { sent, failed }
  }

  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    return this.invoiceRepository.getTotalRevenue(startDate, endDate)
  }

  async getInvoicePreview(invoiceData: InvoiceData): Promise<any> {
    const validation = this.templateService.validateInvoiceData(invoiceData)
    if (!validation.isValid) {
      throw new BadRequestException(`Invalid invoice data: ${validation.errors.join(", ")}`)
    }

    return this.templateService.generateInvoicePreview(invoiceData)
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    const invoice = await this.invoiceRepository.findById(invoiceId)
    if (!invoice) {
      throw new NotFoundException("Invoice not found")
    }

    // Only allow deletion of draft invoices
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException("Only draft invoices can be deleted")
    }

    await this.invoiceItemRepository.deleteByInvoiceId(invoiceId)
    await this.invoiceRepository.update(invoiceId, { status: InvoiceStatus.CANCELLED })

    this.logger.log(`Invoice deleted: ${invoice.invoiceNumber}`)
  }
}
