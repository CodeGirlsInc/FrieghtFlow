import { Injectable, Logger } from "@nestjs/common"
import * as PDFDocument from "pdfkit"
import * as fs from "fs"
import * as path from "path"
import type { InvoiceConfigService } from "../config/invoice-config.service"
import type { Invoice } from "../entities/invoice.entity"
import type { PdfGenerationOptions } from "../types/invoice.types"

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name)

  constructor(private readonly configService: InvoiceConfigService) {}

  async generateInvoicePdf(invoice: Invoice, options: PdfGenerationOptions = {}): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: options.pageSize || "A4",
          margins: options.margins || { top: 50, bottom: 50, left: 50, right: 50 },
        })

        const buffers: Buffer[] = []
        doc.on("data", buffers.push.bind(buffers))
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers)
          resolve(pdfBuffer)
        })
        doc.on("error", reject)

        this.buildInvoicePdf(doc, invoice, options)
        doc.end()
      } catch (error) {
        this.logger.error("Failed to generate PDF", error)
        reject(error)
      }
    })
  }

  async saveInvoicePdf(invoice: Invoice, pdfBuffer: Buffer): Promise<string> {
    const storageDir = this.configService.storageDirectory
    const fileName = `invoice-${invoice.invoiceNumber}.pdf`
    const filePath = path.join(storageDir, fileName)

    // Ensure directory exists
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true })
    }

    fs.writeFileSync(filePath, pdfBuffer)
    this.logger.log(`Invoice PDF saved: ${filePath}`)

    return filePath
  }

  private buildInvoicePdf(doc: PDFKit.PDFDocument, invoice: Invoice, options: PdfGenerationOptions): void {
    // Header
    this.addHeader(doc, invoice)

    // Business and Customer Info
    this.addBusinessInfo(doc)
    this.addCustomerInfo(doc, invoice)

    // Invoice Details
    this.addInvoiceDetails(doc, invoice)

    // Items Table
    this.addItemsTable(doc, invoice)

    // Totals
    this.addTotals(doc, invoice)

    // Footer
    this.addFooter(doc, invoice)

    // Watermark if specified
    if (options.includeWatermark) {
      this.addWatermark(doc, options.watermarkText || "DRAFT")
    }
  }

  private addHeader(doc: PDFKit.PDFDocument, invoice: Invoice): void {
    // Logo (if available)
    const logoPath = this.configService.businessLogo
    if (logoPath && fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 50, { width: 100 })
    }

    // Invoice Title
    doc.fontSize(24).font("Helvetica-Bold").text("INVOICE", 400, 50, { align: "right" })

    // Invoice Number
    doc.fontSize(12).font("Helvetica").text(`Invoice #: ${invoice.invoiceNumber}`, 400, 80, { align: "right" })

    doc.moveDown(2)
  }

  private addBusinessInfo(doc: PDFKit.PDFDocument): void {
    const startY = 120

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(this.configService.businessName, 50, startY)
      .fontSize(10)
      .font("Helvetica")
      .text(this.configService.businessAddress, 50, startY + 20)
      .text(`Phone: ${this.configService.businessPhone}`, 50, startY + 35)
      .text(`Email: ${this.configService.businessEmail}`, 50, startY + 50)

    if (this.configService.businessWebsite) {
      doc.text(`Website: ${this.configService.businessWebsite}`, 50, startY + 65)
    }

    if (this.configService.businessTaxId) {
      doc.text(`Tax ID: ${this.configService.businessTaxId}`, 50, startY + 80)
    }
  }

  private addCustomerInfo(doc: PDFKit.PDFDocument, invoice: Invoice): void {
    const startY = 120

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Bill To:", 350, startY)
      .fontSize(11)
      .font("Helvetica")
      .text(invoice.customerName, 350, startY + 20)
      .text(invoice.customerEmail, 350, startY + 35)

    if (invoice.customerAddress) {
      doc.text(invoice.customerAddress, 350, startY + 50)
    }

    if (invoice.customerPhone) {
      doc.text(`Phone: ${invoice.customerPhone}`, 350, startY + 65)
    }

    if (invoice.customerTaxId) {
      doc.text(`Tax ID: ${invoice.customerTaxId}`, 350, startY + 80)
    }
  }

  private addInvoiceDetails(doc: PDFKit.PDFDocument, invoice: Invoice): void {
    const startY = 250

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Issue Date:", 50, startY)
      .font("Helvetica")
      .text(invoice.issueDate.toLocaleDateString(), 120, startY)

    doc
      .font("Helvetica-Bold")
      .text("Due Date:", 50, startY + 15)
      .font("Helvetica")
      .text(invoice.dueDate.toLocaleDateString(), 120, startY + 15)

    if (invoice.paymentTerms) {
      doc
        .font("Helvetica-Bold")
        .text("Payment Terms:", 50, startY + 30)
        .font("Helvetica")
        .text(invoice.paymentTerms, 120, startY + 30)
    }

    doc.font("Helvetica-Bold").text("Currency:", 300, startY).font("Helvetica").text(invoice.currency, 350, startY)

    doc
      .font("Helvetica-Bold")
      .text("Status:", 300, startY + 15)
      .font("Helvetica")
      .text(invoice.status.toUpperCase(), 350, startY + 15)

    doc.moveDown(2)
  }

  private addItemsTable(doc: PDFKit.PDFDocument, invoice: Invoice): void {
    const startY = 320
    const tableTop = startY
    const itemCodeX = 50
    const descriptionX = 150
    const quantityX = 350
    const priceX = 400
    const totalX = 480

    // Table Header
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Description", descriptionX, tableTop)
      .text("Qty", quantityX, tableTop)
      .text("Price", priceX, tableTop)
      .text("Total", totalX, tableTop)

    // Header line
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke()

    // Table Rows
    let currentY = tableTop + 25
    doc.font("Helvetica").fontSize(9)

    for (const item of invoice.items) {
      const lineTotal = item.lineTotal

      doc
        .text(item.description, descriptionX, currentY, { width: 180 })
        .text(item.quantity.toString(), quantityX, currentY)
        .text(`${invoice.currency} ${item.unitPrice.toFixed(2)}`, priceX, currentY)
        .text(`${invoice.currency} ${lineTotal.toFixed(2)}`, totalX, currentY)

      currentY += 20

      // Add line between items
      if (currentY > 700) {
        doc.addPage()
        currentY = 50
      }
    }

    // Bottom line
    doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, currentY).lineTo(550, currentY).stroke()
  }

  private addTotals(doc: PDFKit.PDFDocument, invoice: Invoice): void {
    const startY = doc.y + 20

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Subtotal:", 400, startY)
      .text(`${invoice.currency} ${invoice.subtotal.toFixed(2)}`, 480, startY)

    if (invoice.discountAmount > 0) {
      doc
        .text("Discount:", 400, startY + 15)
        .text(`-${invoice.currency} ${invoice.discountAmount.toFixed(2)}`, 480, startY + 15)
    }

    if (invoice.taxAmount > 0) {
      doc.text("Tax:", 400, startY + 30).text(`${invoice.currency} ${invoice.taxAmount.toFixed(2)}`, 480, startY + 30)
    }

    // Total line
    doc
      .strokeColor("#000000")
      .lineWidth(2)
      .moveTo(400, startY + 45)
      .lineTo(550, startY + 45)
      .stroke()

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Total:", 400, startY + 50)
      .text(`${invoice.currency} ${invoice.total.toFixed(2)}`, 480, startY + 50)

    if (invoice.paidAmount > 0) {
      doc
        .fontSize(10)
        .font("Helvetica")
        .text("Paid:", 400, startY + 70)
        .text(`${invoice.currency} ${invoice.paidAmount.toFixed(2)}`, 480, startY + 70)

      doc
        .font("Helvetica-Bold")
        .text("Balance Due:", 400, startY + 85)
        .text(`${invoice.currency} ${invoice.balanceDue.toFixed(2)}`, 480, startY + 85)
    }
  }

  private addFooter(doc: PDFKit.PDFDocument, invoice: Invoice): void {
    const bottomY = 750

    if (invoice.notes) {
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Notes:", 50, bottomY - 60)
        .font("Helvetica")
        .text(invoice.notes, 50, bottomY - 45, { width: 500 })
    }

    // Footer text
    doc.fontSize(8).font("Helvetica").text("Thank you for your business!", 50, bottomY, { align: "center", width: 500 })
  }

  private addWatermark(doc: PDFKit.PDFDocument, text: string): void {
    doc
      .save()
      .fontSize(60)
      .font("Helvetica-Bold")
      .fillColor("#cccccc")
      .rotate(-45, { origin: [300, 400] })
      .text(text, 200, 400, { align: "center" })
      .restore()
  }
}
