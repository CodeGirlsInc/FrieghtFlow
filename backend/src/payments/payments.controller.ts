import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post('process')
  process(@Body() dto: ProcessPaymentDto) {
    return this.service.processPayment(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/refund')
  refund(@Param('id') id: string, @Req() req: any) {
    return this.service.refund(id, req.user?.isAdmin);
  }

  @Get('freight-job/:jobId')
  findByJob(@Param('jobId') jobId: string) {
    return this.service.findByJob(jobId);
  }
}
