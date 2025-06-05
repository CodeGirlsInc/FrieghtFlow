import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Res,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common"
import type { Response } from "express"
import type { InvoiceService } from "./invoice.service"
import type { CreateInvoiceDto } from "./dto/create-invoice.dto"
import type { EmailInvoiceDto } from "./dto/email-invoice.dto"
import type { UpdateInvoiceStatusDto, UpdatePaymentStatusDto } from "./dto/update-invoice-status.dto"

@Controller("invoices")
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    const { customer, items, metadata, dueDate, issueDate, currency, paymentTerms, notes } = createInvoiceDto;
    const invoiceData = {
      customer,
      items,
      metadata,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      issueDate: issueDate ? new Date(issueDate) : undefined,
      currency,
      paymentTerms,
      notes,
    }

    return this.invoiceService.createInvoice(invoiceData)
  }

  @Post("preview")
  async getInvoicePreview(@Body() createInvoiceDto: CreateInvoiceDto) {
    const invoiceData = {
      customer: createInvoiceDto.customer,
      items: createInvoiceDto.items,
      metadata: createInvoiceDto.metadata,
      dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : undefined,
      issueDate: createInvoiceDto.issueDate ? new Date(createInvoiceDto.issueDate) : undefined,
      currency: createInvoiceDto.currency,
      paymentTerms: createInvoiceDto.paymentTerms,
      notes: createInvoiceDto.notes,
    }

    return this.invoiceService.getInvoicePreview(invoiceData)
  }

  @Get()
  async getAllInvoices(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.invoiceService.getAllInvoices(page, limit)
  }

  @Get("overdue")
  async getOverdueInvoices() {
    return this.invoiceService.getOverdueInvoices()
  }

  @Get("revenue")
  async getTotalRevenue(@Query("startDate") startDate?: string, @Query("endDate") endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    const revenue = await this.invoiceService.getTotalRevenue(start, end)
    return { revenue }
  }

  @Get("customer/:email")
  async getCustomerInvoices(@Param("email") email: string) {
    return this.invoiceService.getCustomerInvoices(email)
  }

  @Get(":id")
  async getInvoice(@Param("id") id: string) {
    return this.invoiceService.getInvoice(id)
  }

  @Get("number/:invoiceNumber")
  async getInvoiceByNumber(@Param("invoiceNumber") invoiceNumber: string) {
    return this.invoiceService.getInvoiceByNumber(invoiceNumber)
  }

  @Get(":id/pdf")
  async downloadInvoicePdf(@Param("id") id: string, @Res() res: Response) {
    const { invoice, pdfBuffer } = await this.invoiceService.generateInvoicePdf(id)

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      "Content-Length": pdfBuffer.length,
    })

    res.status(HttpStatus.OK).send(pdfBuffer)
  }

  @Get(":id/pdf/view")
  async viewInvoicePdf(@Param("id") id: string, @Res() res: Response) {
    const { invoice, pdfBuffer } = await this.invoiceService.generateInvoicePdf(id)

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      "Content-Length": pdfBuffer.length,
    })

    res.status(HttpStatus.OK).send(pdfBuffer)
  }

  @Post(":id/email")
  async sendInvoiceEmail(@Param("id") id: string, @Body() emailDto: EmailInvoiceDto) {
    return this.invoiceService.sendInvoiceEmail(id, emailDto)
  }

  @Post("reminders/send")
  async sendPaymentReminders() {
    return this.invoiceService.sendPaymentReminders()
  }

  @Put(":id/status")
  async updateInvoiceStatus(@Param("id") id: string, @Body() updateStatusDto: UpdateInvoiceStatusDto) {
    return this.invoiceService.updateInvoiceStatus(id, updateStatusDto.status)
  }

  @Put(":id/payment")
  async updatePaymentStatus(@Param("id") id: string, @Body() updatePaymentDto: UpdatePaymentStatusDto) {
    return this.invoiceService.updatePaymentStatus(id, updatePaymentDto.paymentStatus, updatePaymentDto.paidAmount)
  }

  @Delete(":id")
  async deleteInvoice(@Param("id") id: string) {
    await this.invoiceService.deleteInvoice(id)
    return { message: "Invoice deleted successfully" }
  }
}
