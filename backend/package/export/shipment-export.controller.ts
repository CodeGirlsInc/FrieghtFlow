import {
  Controller,
  Get,
  Query,
  Res,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  ShipmentExportService,
  ShipmentExportQuery,
} from './shipment-export.service';

interface AuthRequest {
  user: { id: string; role?: string };
}

@UseGuards(AuthGuard('jwt'))
@Controller('api/shipments/export')
export class ShipmentExportController {
  constructor(private readonly exportService: ShipmentExportService) {}

  @Get('csv')
  async exportCsv(
    @Request() req: AuthRequest,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    const query: ShipmentExportQuery = { startDate, endDate, status };
    const isAdmin = req.user.role === 'admin';
    await this.exportService.streamCsv(res, req.user.id, isAdmin, query);
  }
}
