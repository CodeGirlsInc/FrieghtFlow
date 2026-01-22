import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('api/v1/invoices')
export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}

  @Post('generate')
  generate(@Body() body: any) {
    return this.service.generate(body.freightJobId, body.amount);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
