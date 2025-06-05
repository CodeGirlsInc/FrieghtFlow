import { Injectable, Logger } from "@nestjs/common"
import * as nodemailer from "nodemailer"
import type { InvoiceConfigService } from "../config/invoice-config.service"
import type { Invoice } from "../entities/invoice.entity"
import type { EmailDeliveryOptions } from "../types/invoice.types"

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private transporter: nodemailer.Transporter

  constructor(private readonly configService: InvoiceConfigService) {
    this.initializeTransporter()
  }

  private initializeTransporter(): void {
    if (!this.configService.enableEmailDelivery) {
      this.logger.warn("Email delivery is disabled")
      return
    }

    this.transporter = nodemailer.createTransporter({
      host: this.configService.smtpHost,
      port: this.configService.smtpPort,
      secure: this.configService.smtpSecure,
      auth: {
        user: this.configService.smtpUser,
        pass: this.configService.smtpPassword,
      },
    })
  }

  async sendInvoiceEmail(
    invoice: Invoice,
    pdfBuffer: Buffer,
    options: EmailDeliveryOptions,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.configService.enableEmailDelivery || !this.transporter) {
      return { success: false, error: "Email delivery is not configured" }
    }

    try {
      const subject = options.subject || `Invoice ${invoice.invoiceNumber} from ${this.configService.businessName}`
      const htmlContent = this.generateEmailTemplate(invoice, options.message)

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${this.configService.businessName}" <${this.configService.businessEmail}>`,
        to: options.to.join(", "),
        cc: options.cc?.join(", "),
        bcc: options.bcc?.join(", "),
        subject,
        html: htmlContent,
        attachments: options.attachPdf
          ? [
              {
                filename: `invoice-${invoice.invoiceNumber}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ]
          : [],
      }

      const result = await this.transporter.sendMail(mailOptions)
      this.logger.log(`Invoice email sent successfully: ${result.messageId}`)

      return { success: true, messageId: result.messageId }
    } catch (error) {
      this.logger.error("Failed to send invoice email", error)
      return { success: false, error: error.message }
    }
  }

  async sendPaymentReminderEmail(
    invoice: Invoice,
    options: Partial<EmailDeliveryOptions> = {},
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.configService.enableEmailDelivery || !this.transporter) {
      return { success: false, error: "Email delivery is not configured" }
    }

    try {
      const daysOverdue = Math.floor((new Date().getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))

      const subject = `Payment Reminder: Invoice ${invoice.invoiceNumber} - ${daysOverdue} days overdue`
      const htmlContent = this.generateReminderEmailTemplate(invoice, daysOverdue)

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${this.configService.businessName}" <${this.configService.businessEmail}>`,
        to: options.to?.join(", ") || invoice.customerEmail,
        cc: options.cc?.join(", "),
        bcc: options.bcc?.join(", "),
        subject,
        html: htmlContent,
      }

      const result = await this.transporter.sendMail(mailOptions)
      this.logger.log(`Payment reminder email sent successfully: ${result.messageId}`)

      return { success: true, messageId: result.messageId }
    } catch (error) {
      this.logger.error("Failed to send payment reminder email", error)
      return { success: false, error: error.message }
    }
  }

  private generateEmailTemplate(invoice: Invoice, customMessage?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .invoice-details { background-color: #fff; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; }
          .amount { font-size: 18px; font-weight: bold; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Invoice from ${this.configService.businessName}</h2>
            <p>Dear ${invoice.customerName},</p>
            ${
              customMessage
                ? `<p>${customMessage}</p>`
                : `<p>Please find attached your invoice for recent services. We appreciate your business!</p>`
            }
          </div>
          
          <div class="invoice-details">
            <h3>Invoice Details</h3>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Issue Date:</strong> ${invoice.issueDate.toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
            <p><strong>Amount Due:</strong> <span class="amount">${invoice.currency} ${invoice.total.toFixed(
              2,
            )}</span></p>
            ${invoice.paymentTerms ? `<p><strong>Payment Terms:</strong> ${invoice.paymentTerms}</p>` : ""}
          </div>
          
          <div class="footer">
            <p>If you have any questions about this invoice, please contact us at ${
              this.configService.businessEmail
            } or ${this.configService.businessPhone}.</p>
            <p>Thank you for your business!</p>
            <p>${this.configService.businessName}<br>
            ${this.configService.businessAddress}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generateReminderEmailTemplate(invoice: Invoice, daysOverdue: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Reminder - Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #fff3cd; padding: 20px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #ffc107; }
          .invoice-details { background-color: #fff; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; }
          .amount { font-size: 18px; font-weight: bold; color: #dc3545; }
          .overdue { color: #dc3545; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Payment Reminder</h2>
            <p>Dear ${invoice.customerName},</p>
            <p>This is a friendly reminder that your invoice is now <span class="overdue">${daysOverdue} days overdue</span>.</p>
          </div>
          
          <div class="invoice-details">
            <h3>Invoice Details</h3>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Original Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
            <p><strong>Amount Due:</strong> <span class="amount">${invoice.currency} ${invoice.balanceDue.toFixed(
              2,
            )}</span></p>
            <p><strong>Days Overdue:</strong> <span class="overdue">${daysOverdue} days</span></p>
          </div>
          
          <p>Please arrange payment at your earliest convenience to avoid any late fees or service interruptions.</p>
          
          <div class="footer">
            <p>If you have any questions or need to discuss payment arrangements, please contact us immediately at ${
              this.configService.businessEmail
            } or ${this.configService.businessPhone}.</p>
            <p>Thank you for your prompt attention to this matter.</p>
            <p>${this.configService.businessName}<br>
            ${this.configService.businessAddress}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}
