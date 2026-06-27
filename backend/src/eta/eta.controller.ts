import { Controller, Post, Get, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ETAService } from './eta.service';
import { CalculateETADto } from './dto/calculate-eta.dto';

@ApiTags('shipments')
@ApiBearerAuth()
@Controller('shipments')
export class ETAController {
  constructor(private readonly etaService: ETAService) {}

  @Post(':id/calculate-eta')
  @ApiOperation({ summary: 'Calculate ETA for a shipment' })
  calculateETA(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CalculateETADto) {
    return this.etaService.recalculateForShipment(id, dto);
  }

  @Get(':id/eta')
  @ApiOperation({ summary: 'Get estimated delivery info for a shipment' })
  getETA(@Param('id', ParseUUIDPipe) id: string) {
    return this.etaService.calculateETA({ originCity: 'Lagos', destinationCity: 'Abuja' });
  }
}
