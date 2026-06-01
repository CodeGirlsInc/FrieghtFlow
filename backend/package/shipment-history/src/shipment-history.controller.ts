import { Controller, Get, Param } from '@nestjs/common';
import { ShipmentStatusHistoryService } from './shipment-status-history.service';

@Controller('api/shipments')
export class ShipmentHistoryController {
  constructor(private svc: ShipmentStatusHistoryService) {}

  @Get(':id/history')
  async getHistory(@Param('id') id: string) {
    return this.svc.getHistory(id);
  }
}
