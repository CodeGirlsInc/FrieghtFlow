import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StellarFreightService } from './stellar-freight.service';
import {
  CreateBookingDto,
  ConfirmCapacityDto,
  BookingQueryDto,
} from './dto';

@Controller('freight-bookings')
export class StellarFreightController {
  constructor(private readonly freightService: StellarFreightService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(@Body() dto: CreateBookingDto) {
    return this.freightService.createBooking(dto);
  }

  @Patch(':bookingId/confirm-capacity')
  async confirmCapacity(
    @Param('bookingId') bookingId: string,
    @Body() dto: ConfirmCapacityDto,
  ) {
    return this.freightService.confirmCapacity(bookingId, dto);
  }

  @Get(':bookingId')
  async getBooking(@Param('bookingId') bookingId: string) {
    return this.freightService.getBooking(bookingId);
  }

  @Get()
  async listBookings(@Query() query: BookingQueryDto) {
    return this.freightService.listBookings(query);
  }

  @Get(':bookingId/contract-state')
  async getContractState(@Param('bookingId') bookingId: string) {
    return this.freightService.getContractState(bookingId);
  }
}
