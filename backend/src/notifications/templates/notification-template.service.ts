import { Injectable, Logger } from '@nestjs/common';
import { NotificationType } from '../entities';

export interface NotificationTemplate {
  subject: string;
  body: string;
}

@Injectable()
export class NotificationTemplateService {
  private readonly logger = new Logger(NotificationTemplateService.name);

  private templates: Record<NotificationType, (data: Record<string, any>) => NotificationTemplate> = {
    [NotificationType.SHIPMENT_CREATED]: (data) => ({
      subject: 'New Shipment Created',
      body: this.renderShipmentCreated(data),
    }),
    [NotificationType.SHIPMENT_ASSIGNED]: (data) => ({
      subject: 'Shipment Assigned to Carrier',
      body: this.renderShipmentAssigned(data),
    }),
    [NotificationType.STATUS_UPDATED]: (data) => ({
      subject: 'Shipment Status Updated',
      body: this.renderStatusUpdated(data),
    }),
    [NotificationType.DELIVERY_CONFIRMED]: (data) => ({
      subject: 'Shipment Delivered',
      body: this.renderDeliveryConfirmed(data),
    }),
    [NotificationType.PAYMENT_RECEIVED]: (data) => ({
      subject: 'Payment Received',
      body: this.renderPaymentReceived(data),
    }),
    [NotificationType.ISSUE_REPORTED]: (data) => ({
      subject: 'Issue Reported on Shipment',
      body: this.renderIssueReported(data),
    }),
  };

  renderTemplate(
    notificationType: NotificationType,
    data: Record<string, any>,
  ): NotificationTemplate {
    const templateRenderer = this.templates[notificationType];

    if (!templateRenderer) {
      this.logger.warn(`No template found for notification type: ${notificationType}`);
      return {
        subject: 'Notification',
        body: 'You have a new notification',
      };
    }

    return templateRenderer(data);
  }

  private renderShipmentCreated(data: Record<string, any>): string {
    return `
      <h2>New Shipment Created</h2>
      <p>A new shipment has been created with the following details:</p>
      <ul>
        <li><strong>Shipment ID:</strong> ${data.shipmentId || 'N/A'}</li>
        <li><strong>Origin:</strong> ${data.origin || 'N/A'}</li>
        <li><strong>Destination:</strong> ${data.destination || 'N/A'}</li>
        <li><strong>Status:</strong> ${data.status || 'Pending'}</li>
      </ul>
      <p>You can track your shipment anytime in your dashboard.</p>
    `;
  }

  private renderShipmentAssigned(data: Record<string, any>): string {
    return `
      <h2>Shipment Assigned to Carrier</h2>
      <p>Your shipment has been assigned to a carrier:</p>
      <ul>
        <li><strong>Shipment ID:</strong> ${data.shipmentId || 'N/A'}</li>
        <li><strong>Carrier:</strong> ${data.carrierName || 'N/A'}</li>
        <li><strong>Carrier Reference:</strong> ${data.carrierReference || 'N/A'}</li>
        <li><strong>Estimated Pickup:</strong> ${data.estimatedPickup || 'N/A'}</li>
      </ul>
      <p>Track your shipment for real-time updates.</p>
    `;
  }

  private renderStatusUpdated(data: Record<string, any>): string {
    return `
      <h2>Shipment Status Updated</h2>
      <p>Your shipment status has been updated:</p>
      <ul>
        <li><strong>Shipment ID:</strong> ${data.shipmentId || 'N/A'}</li>
        <li><strong>Previous Status:</strong> ${data.previousStatus || 'N/A'}</li>
        <li><strong>Current Status:</strong> ${data.currentStatus || 'N/A'}</li>
        <li><strong>Updated At:</strong> ${data.updatedAt || 'N/A'}</li>
      </ul>
      <p>Location: ${data.location || 'N/A'}</p>
    `;
  }

  private renderDeliveryConfirmed(data: Record<string, any>): string {
    return `
      <h2>Shipment Delivered</h2>
      <p>Your shipment has been successfully delivered:</p>
      <ul>
        <li><strong>Shipment ID:</strong> ${data.shipmentId || 'N/A'}</li>
        <li><strong>Delivered At:</strong> ${data.deliveredAt || 'N/A'}</li>
        <li><strong>Recipient:</strong> ${data.recipient || 'N/A'}</li>
        <li><strong>Signature Required:</strong> ${data.signatureRequired ? 'Yes' : 'No'}</li>
      </ul>
      <p>Thank you for using our service!</p>
    `;
  }

  private renderPaymentReceived(data: Record<string, any>): string {
    return `
      <h2>Payment Received</h2>
      <p>We have received your payment:</p>
      <ul>
        <li><strong>Transaction ID:</strong> ${data.transactionId || 'N/A'}</li>
        <li><strong>Amount:</strong> ${data.amount || 'N/A'}</li>
        <li><strong>Currency:</strong> ${data.currency || 'USD'}</li>
        <li><strong>Date:</strong> ${data.date || 'N/A'}</li>
      </ul>
      <p>Your shipment details have been updated accordingly.</p>
    `;
  }

  private renderIssueReported(data: Record<string, any>): string {
    return `
      <h2>Issue Reported on Shipment</h2>
      <p>An issue has been reported on your shipment:</p>
      <ul>
        <li><strong>Shipment ID:</strong> ${data.shipmentId || 'N/A'}</li>
        <li><strong>Issue Type:</strong> ${data.issueType || 'General'}</li>
        <li><strong>Description:</strong> ${data.description || 'No description provided'}</li>
        <li><strong>Reported At:</strong> ${data.reportedAt || 'N/A'}</li>
      </ul>
      <p>Our team will investigate and contact you shortly with updates.</p>
    `;
  }
}
