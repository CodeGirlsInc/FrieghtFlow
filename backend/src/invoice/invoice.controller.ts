import { Controller, Get, Post, Body, Param, Patch } from "@nestjs/common";
import { InvoiceService } from "./invoice.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";

@Controller("invoices")
export class InvoiceController {
  constructor(private readonly svc: InvoiceService) {}

  @Post()
  async create(@Body() dto: CreateInvoiceDto) {
    return this.svc.create(dto);
  }

  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.svc.findOne(id);
  }

  @Patch(":id/pay")
  async markPaid(@Param("id") id: string) {
    return this.svc.markAsPaid(id);
  }
}
