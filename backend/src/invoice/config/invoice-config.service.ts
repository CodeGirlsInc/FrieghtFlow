import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"

@Injectable()
export class InvoiceConfigService {
  constructor(private configService: ConfigService) {}

  // Business Information
  get businessName(): string {
    return this.configService.get<string>("INVOICE_BUSINESS_NAME", "Your Business Name")
  }

  get businessAddress(): string {
    return this.configService.get<string>("INVOICE_BUSINESS_ADDRESS", "123 Business St, City, State 12345")
  }

  get businessPhone(): string {
    return this.configService.get<string>("INVOICE_BUSINESS_PHONE", "+1 (555) 123-4567")
  }

  get businessEmail(): string {
    return this.configService.get<string>("INVOICE_BUSINESS_EMAIL", "billing@yourbusiness.com")
  }

  get businessWebsite(): string {
    return this.configService.get<string>("INVOICE_BUSINESS_WEBSITE", "www.yourbusiness.com")
  }

  get businessTaxId(): string {
    return this.configService.get<string>("INVOICE_BUSINESS_TAX_ID", "")
  }

  get businessLogo(): string {
    return this.configService.get<string>("INVOICE_BUSINESS_LOGO", "")
  }

  // Invoice Settings
  get invoicePrefix(): string {
    return this.configService.get<string>("INVOICE_PREFIX", "INV")
  }

  get defaultCurrency(): string {
    return this.configService.get<string>("INVOICE_DEFAULT_CURRENCY", "USD")
  }

  get defaultTaxRate(): number {
    return this.configService.get<number>("INVOICE_DEFAULT_TAX_RATE", 0.1)
  }

  get paymentTerms(): string {
    return this.configService.get<string>("INVOICE_PAYMENT_TERMS", "Net 30")
  }

  get dueDays(): number {
    return this.configService.get<number>("INVOICE_DUE_DAYS", 30)
  }

  // Email Settings
  get smtpHost(): string {
    return this.configService.get<string>("SMTP_HOST", "")
  }

  get smtpPort(): number {
    return this.configService.get<number>("SMTP_PORT", 587)
  }

  get smtpUser(): string {
    return this.configService.get<string>("SMTP_USER", "")
  }

  get smtpPassword(): string {
    return this.configService.get<string>("SMTP_PASSWORD", "")
  }

  get smtpSecure(): boolean {
    return this.configService.get<boolean>("SMTP_SECURE", false)
  }

  // Storage Settings
  get storageDirectory(): string {
    return this.configService.get<string>("INVOICE_STORAGE_DIR", "./storage/invoices")
  }

  get enableEmailDelivery(): boolean {
    return this.configService.get<boolean>("INVOICE_EMAIL_ENABLED", true)
  }

  get enablePdfStorage(): boolean {
    return this.configService.get<boolean>("INVOICE_PDF_STORAGE_ENABLED", true)
  }
}
