import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationListener {
  constructor(private notificationService: NotificationService) {}

  @OnEvent('shipment.updated')
  handleShipmentUpdated(payload: { shipmentId: string; userId: string; status: string }): void {
    const { shipmentId, userId, status } = payload;
    this.notificationService.sendNotification({
      type: 'SHIPMENT_UPDATED',
      userId,
      message: `Your shipment #${shipmentId} status has been updated to ${status}`,
      metadata: { shipmentId, status },
      persist: true,
    });
  }

  @OnEvent('booking.created')
  handleBookingCreated(payload: { bookingId: string; userId: string }): void {
    const { bookingId, userId } = payload;
    this.notificationService.sendNotification({
      type: 'BOOKING_CREATED',
      userId,
      message: `New booking created with ID: ${bookingId}`,
      metadata: { bookingId },
      persist: true,
    });
  }

  @OnEvent('payment.successful')
  handlePaymentSuccessful(payload: { paymentId: string; userId: string; amount: number }): void {
    const { paymentId, userId, amount } = payload;
    this.notificationService.sendNotification({
      type: 'PAYMENT_SUCCESSFUL',
      userId,
      message: `Payment of $${amount} was successfully processed`,
      metadata: { paymentId, amount },
      persist: true,
    });
  }
}