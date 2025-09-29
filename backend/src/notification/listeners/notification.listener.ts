import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService, NotificationPayload } from '../notifications.service';

@Injectable()
export class NotificationEventListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Example listener for a shipment update
  @OnEvent('shipment.updated')
  handleShipmentUpdatedEvent(payload: { userId: string; userEmail: string; trackingNumber: string }) {
    const notification: NotificationPayload = {
      userId: payload.userId,
      userEmail: payload.userEmail,
      subject: `Your Shipment #${payload.trackingNumber} is on its way!`,
      emailBody: `<p>Great news! Your shipment with tracking number <strong>${payload.trackingNumber}</strong> has been updated.</p>`,
      inAppMessage: `Your shipment #${payload.trackingNumber} has been updated.`,
      channels: ['email', 'in-app'],
    };
    this.notificationsService.send(notification);
  }

  // Example listener for a payment confirmation
  @OnEvent('payment.confirmed')
  handlePaymentConfirmedEvent(payload: { userId: string; userEmail: string; amount: number; orderId: string }) {
    const notification: NotificationPayload = {
      userId: payload.userId,
      userEmail: payload.userEmail,
      subject: 'Payment Confirmed!',
      emailBody: `<p>We've received your payment of <strong>$${payload.amount}</strong> for order #${payload.orderId}. Thank you!</p>`,
      inAppMessage: `Payment of $${payload.amount} for order #${payload.orderId} was successful.`,
      channels: ['email'], // This notification only goes to email
    };
    this.notificationsService.send(notification);
  }
}