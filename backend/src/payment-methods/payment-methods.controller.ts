import { Controller, Get, Post, Delete, Param, Body, Req } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('api/v1/payment-methods')
export class PaymentMethodsController {
  constructor(private readonly service: PaymentMethodsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.id);
  }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.service.create({
      ...body,
      userId: req.user.id,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
