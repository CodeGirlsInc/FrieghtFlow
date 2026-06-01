import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

export type ShipmentEventData = {
  to: string;
  trackingNumber: string;
  route: string;
  shipmentId: string;
};

@Injectable()
export class EmailNotificationsService {
  constructor(private mailer: MailerService) {}

  async sendBidPlaced(data: ShipmentEventData) {
    return this.sendTemplate('bid-placed', data);
  }

  async sendBidAccepted(data: ShipmentEventData) {
    return this.sendTemplate('bid-accepted', data);
  }

  async sendShipmentPickedUp(data: ShipmentEventData) {
    return this.sendTemplate('shipment-picked-up', data);
  }

  async sendShipmentDelivered(data: ShipmentEventData) {
    return this.sendTemplate('shipment-delivered', data);
  }

  async sendShipmentCancelled(data: ShipmentEventData) {
    return this.sendTemplate('shipment-cancelled', data);
  }

  private async sendTemplate(template: string, data: ShipmentEventData) {
    const link = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/shipments/${data.shipmentId}`;

    return this.mailer.sendMail({
      to: data.to,
      subject: `Shipment ${data.trackingNumber} update`,
      template,
      context: { ...data, link },
    });
  }
}
