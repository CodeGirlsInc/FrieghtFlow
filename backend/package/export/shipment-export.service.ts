import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Response } from 'express';
import { Shipment } from '../../src/shipments/entities/shipment.entity';

export interface ShipmentExportRow {
  trackingNumber: string;
  origin: string;
  destination: string;
  status: string;
  cargoCategory: string | null;
  price: number | null;
  currency: string;
  createdAt: Date;
  actualDeliveryDate: Date | null;
}

export interface ShipmentExportQuery {
  startDate?: string;
  endDate?: string;
  status?: string;
}

// Minimal entity shape – real project would import the real entity
interface ShipmentLike {
  trackingNumber: string;
  origin: string;
  destination: string;
  status: string;
  cargoCategory: string | null;
  price: number | null;
  currency: string;
  createdAt: Date;
  actualDeliveryDate: Date | null;
  shipperId: string;
}

const CSV_HEADERS = [
  'Tracking Number',
  'Origin',
  'Destination',
  'Status',
  'Cargo Category',
  'Price',
  'Currency',
  'Created Date',
  'Delivered Date',
];

function escapeCell(val: string | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

function rowToCsv(s: ShipmentLike): string {
  return [
    s.trackingNumber,
    s.origin,
    s.destination,
    s.status,
    s.cargoCategory ?? '',
    s.price !== null ? String(s.price) : '',
    s.currency,
    s.createdAt.toISOString(),
    s.actualDeliveryDate ? s.actualDeliveryDate.toISOString() : '',
  ]
    .map(escapeCell)
    .join(',');
}

@Injectable()
export class ShipmentExportService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<ShipmentLike>,
  ) {}

  async streamCsv(
    res: Response,
    userId: string,
    isAdmin: boolean,
    query: ShipmentExportQuery,
  ): Promise<void> {
    const where: FindOptionsWhere<ShipmentLike> & Record<string, unknown> = {};

    if (!isAdmin) where['shipperId'] = userId;
    if (query.status) where['status'] = query.status;

    if (query.startDate && query.endDate) {
      where['createdAt'] = Between(new Date(query.startDate), new Date(query.endDate));
    } else if (query.startDate) {
      where['createdAt'] = MoreThanOrEqual(new Date(query.startDate));
    } else if (query.endDate) {
      where['createdAt'] = LessThanOrEqual(new Date(query.endDate));
    }

    const shipments = await this.shipmentRepo.find({ where });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=shipments.csv');

    res.write(CSV_HEADERS.join(',') + '\n');
    for (const s of shipments) {
      res.write(rowToCsv(s) + '\n');
    }
    res.end();
  }
}
