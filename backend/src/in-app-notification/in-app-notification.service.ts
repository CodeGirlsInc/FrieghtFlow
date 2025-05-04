import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPayload } from './interfaces/notification-payload.interface';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private eventEmitter: EventEmitter2,
  ) {}

  async sendNotification(payload: NotificationPayload): Promise<void> {
    console.log(`Sending notification: ${payload.type} to ${payload.userId}`);
    console.log(`Message: ${payload.message}`);
    
    // Store notification in database
    if (payload.persist) {
      await this.storeNotification(payload);
    }
    
    // Emit event for WebSocket notification
    this.eventEmitter.emit('notification.send', payload);
    
    // In a real application, you'd integrate email service here
    // For example: await this.emailService.sendEmail(payload);
  }
  
  // Rest of the code remains the same...
}

// Example usage in a ShipmentService
// shipment.service.ts
import { Injectable } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ShipmentService {
  constructor(private notificationService: NotificationService) {}

  async updateShipmentStatus(shipmentId: string, userId: string, status: string): Promise<void> {
    // Update shipment status logic...
    
    // Emit notification event
    this.notificationService.emitShipmentUpdated(shipmentId, userId, status);
  }
}

// Example usage in a BookingService
// booking.service.ts
import { Injectable } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BookingService {
  constructor(private notificationService: NotificationService) {}

  async createBooking(userId: string, bookingDetails: any): Promise<{ id: string }> {
    // Create booking logic...
    const bookingId = 'BOOKING-' + Math.random().toString(36).substring(2, 10);
    
    // Emit notification event
    this.notificationService.emitBookingCreated(bookingId, userId);
    
    return { id: bookingId };
  }
}

// Example usage in a PaymentService
// payment.service.ts
import { Injectable } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PaymentService {
  constructor(private notificationService: NotificationService) {}

  async processPayment(userId: string, amount: number): Promise<{ id: string; status: string }> {
    // Process payment logic...
    const paymentId = 'PAYMENT-' + Math.random().toString(36).substring(2, 10);
    
    // Emit notification event
    this.notificationService.emitPaymentSuccessful(paymentId, userId, amount);
    
    return { id: paymentId, status: 'success' };
  }
}