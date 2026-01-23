import { NotificationService } from '../services/notification.service';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { NotificationType } from '../entities';

/**
 * Event-driven notification triggers
 * This can be imported and used throughout the application to trigger notifications
 */
export class NotificationEventHandler {
  constructor(private notificationService: NotificationService) {}

  async onShipmentCreated(shipmentData: {
    shipmentId: string;
    userId: string;
    origin: string;
    destination: string;
    status: string;
    recipientEmail?: string;
    recipientPhone?: string;
  }): Promise<void> {
    const notification: SendNotificationDto = {
      userId: shipmentData.userId,
      type: NotificationType.SHIPMENT_CREATED,
      title: 'New Shipment Created',
      message: `Shipment ${shipmentData.shipmentId} has been created`,
      recipientEmail: shipmentData.recipientEmail,
      recipientPhone: shipmentData.recipientPhone,
      metadata: {
        shipmentId: shipmentData.shipmentId,
        origin: shipmentData.origin,
        destination: shipmentData.destination,
        status: shipmentData.status,
      },
    };

    await this.notificationService.sendNotification(notification);
  }

  async onShipmentAssigned(shipmentData: {
    shipmentId: string;
    userId: string;
    carrierName: string;
    carrierReference: string;
    estimatedPickup: string;
    recipientEmail?: string;
    recipientPhone?: string;
  }): Promise<void> {
    const notification: SendNotificationDto = {
      userId: shipmentData.userId,
      type: NotificationType.SHIPMENT_ASSIGNED,
      title: 'Shipment Assigned to Carrier',
      message: `Your shipment ${shipmentData.shipmentId} has been assigned to ${shipmentData.carrierName}`,
      recipientEmail: shipmentData.recipientEmail,
      recipientPhone: shipmentData.recipientPhone,
      metadata: {
        shipmentId: shipmentData.shipmentId,
        carrierName: shipmentData.carrierName,
        carrierReference: shipmentData.carrierReference,
        estimatedPickup: shipmentData.estimatedPickup,
      },
    };

    await this.notificationService.sendNotification(notification);
  }

  async onStatusUpdated(shipmentData: {
    shipmentId: string;
    userId: string;
    previousStatus: string;
    currentStatus: string;
    location: string;
    updatedAt: string;
    recipientEmail?: string;
    recipientPhone?: string;
  }): Promise<void> {
    const notification: SendNotificationDto = {
      userId: shipmentData.userId,
      type: NotificationType.STATUS_UPDATED,
      title: 'Shipment Status Updated',
      message: `Your shipment ${shipmentData.shipmentId} status has changed to ${shipmentData.currentStatus}`,
      recipientEmail: shipmentData.recipientEmail,
      recipientPhone: shipmentData.recipientPhone,
      metadata: {
        shipmentId: shipmentData.shipmentId,
        previousStatus: shipmentData.previousStatus,
        currentStatus: shipmentData.currentStatus,
        location: shipmentData.location,
        updatedAt: shipmentData.updatedAt,
      },
    };

    await this.notificationService.sendNotification(notification);
  }

  async onDeliveryConfirmed(shipmentData: {
    shipmentId: string;
    userId: string;
    deliveredAt: string;
    recipient: string;
    signatureRequired: boolean;
    recipientEmail?: string;
    recipientPhone?: string;
  }): Promise<void> {
    const notification: SendNotificationDto = {
      userId: shipmentData.userId,
      type: NotificationType.DELIVERY_CONFIRMED,
      title: 'Shipment Delivered',
      message: `Your shipment ${shipmentData.shipmentId} has been delivered`,
      recipientEmail: shipmentData.recipientEmail,
      recipientPhone: shipmentData.recipientPhone,
      metadata: {
        shipmentId: shipmentData.shipmentId,
        deliveredAt: shipmentData.deliveredAt,
        recipient: shipmentData.recipient,
        signatureRequired: shipmentData.signatureRequired,
      },
    };

    await this.notificationService.sendNotification(notification);
  }

  async onPaymentReceived(paymentData: {
    userId: string;
    transactionId: string;
    amount: string;
    currency: string;
    date: string;
    recipientEmail?: string;
    recipientPhone?: string;
  }): Promise<void> {
    const notification: SendNotificationDto = {
      userId: paymentData.userId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Payment Received',
      message: `Payment of ${paymentData.amount} ${paymentData.currency} has been received`,
      recipientEmail: paymentData.recipientEmail,
      recipientPhone: paymentData.recipientPhone,
      metadata: {
        transactionId: paymentData.transactionId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        date: paymentData.date,
      },
    };

    await this.notificationService.sendNotification(notification);
  }

  async onIssueReported(issueData: {
    shipmentId: string;
    userId: string;
    issueType: string;
    description: string;
    reportedAt: string;
    recipientEmail?: string;
    recipientPhone?: string;
  }): Promise<void> {
    const notification: SendNotificationDto = {
      userId: issueData.userId,
      type: NotificationType.ISSUE_REPORTED,
      title: 'Issue Reported on Shipment',
      message: `An issue has been reported on shipment ${issueData.shipmentId}`,
      recipientEmail: issueData.recipientEmail,
      recipientPhone: issueData.recipientPhone,
      metadata: {
        shipmentId: issueData.shipmentId,
        issueType: issueData.issueType,
        description: issueData.description,
        reportedAt: issueData.reportedAt,
      },
    };

    await this.notificationService.sendNotification(notification);
  }
}
