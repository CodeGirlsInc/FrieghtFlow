import { Injectable } from '@nestjs/common';
import { BookingStatus } from './enums/booking-status.enum';
import { BookingQueryDto } from './dto';

// This is a simplified repository - integrate with your actual database
@Injectable()
export class BookingRepository {
  private bookings: Map<string, any> = new Map();

  async create(data: any) {
    const id = this.generateId();
    const booking = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async findById(id: string) {
    return this.bookings.get(id) || null;
  }

  async update(id: string, data: Partial<any>) {
    const booking = this.bookings.get(id);
    if (!booking) return null;

    const updated = {
      ...booking,
      ...data,
      updatedAt: new Date(),
    };
    this.bookings.set(id, updated);
    return updated;
  }

  async findAll(query: BookingQueryDto) {
    let results = Array.from(this.bookings.values());

    if (query.status) {
      results = results.filter(b => b.status === query.status);
    }

    if (query.shipperPublicKey) {
      results = results.filter(
        b => b.shipperPublicKey === query.shipperPublicKey,
      );
    }

    if (query.carrierPublicKey) {
      results = results.filter(
        b => b.carrierPublicKey === query.carrierPublicKey,
      );
    }

    return {
      data: results,
      total: results.length,
    };
  }

  private generateId(): string {
    return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}