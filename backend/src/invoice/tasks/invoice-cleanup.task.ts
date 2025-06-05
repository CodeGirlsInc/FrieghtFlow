import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import type { InvoiceService } from "../invoice.service"

@Injectable()
export class InvoiceCleanupTask {
  private readonly logger = new Logger(InvoiceCleanupTask.name)

  constructor(private readonly invoiceService: InvoiceService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleOverdueInvoices() {
    try {
      this.logger.log("Checking for overdue invoices...")
      const overdueInvoices = await this.invoiceService.getOverdueInvoices()
      this.logger.log(`Found ${overdueInvoices.length} overdue invoices`)
    } catch (error) {
      this.logger.error("Failed to process overdue invoices", error)
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async sendPaymentReminders() {
    try {
      this.logger.log("Sending payment reminders...")
      const result = await this.invoiceService.sendPaymentReminders()
      this.logger.log(`Payment reminders sent: ${result.sent} successful, ${result.failed} failed`)
    } catch (error) {
      this.logger.error("Failed to send payment reminders", error)
    }
  }
}
