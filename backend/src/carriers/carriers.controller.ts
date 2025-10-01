import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { CarriersService } from './carriers.service';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';
import { AssignCarrierDto } from './dto/assign-carrier.dto';

@Controller('carriers')
export class CarriersController {
  constructor(private readonly carriersService: CarriersService) {}

  @Post()
  create(@Body() dto: CreateCarrierDto) {
    return this.carriersService.create(dto);
  }

  @Get()
  findAll() {
    return this.carriersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carriersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCarrierDto) {
    return this.carriersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carriersService.remove(id);
  }

  @Post('assign')
  assign(@Body() dto: AssignCarrierDto) {
    return this.carriersService.assignCarrier(dto);
  }
}
