import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';
import {
  SHIPMENT_ACCEPTED,
  SHIPMENT_IN_TRANSIT,
  SHIPMENT_DELIVERED,
  SHIPMENT_COMPLETED,
  SHIPMENT_CANCELLED,
  SHIPMENT_DISPUTED,
  SHIPMENT_DISPUTE_RESOLVED,
  ShipmentEvent,
} from '../shipments/events/shipment.events';
import { Shipment } from '../shipments/entities/shipment.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly mailerService: MailerService) {}

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private async sendSafe(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({ to, subject, html });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to send email to ${to}: ${msg}`);
    }
  }

  private shipmentSummary(s: Shipment): string {
    return `
      <table style="border-collapse:collapse;width:100%;font-size:14px;">
        <tr><td style="padding:6px 0;color:#6b7280;">Tracking #</td><td style="padding:6px 0;font-weight:600;">${s.trackingNumber}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Route</td><td style="padding:6px 0;">${s.origin} → ${s.destination}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Cargo</td><td style="padding:6px 0;">${s.cargoDescription}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Weight</td><td style="padding:6px 0;">${s.weightKg} kg</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Value</td><td style="padding:6px 0;">${s.currency} ${Number(s.price).toLocaleString()}</td></tr>
      </table>
    `;
  }

  private baseTemplate(title: string, body: string): string {
    return `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#1e40af;margin-bottom:16px;">${title}</h2>
        ${body}
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
        <p style="color:#9ca3af;font-size:12px;">FreightFlow — Decentralized Freight Management</p>
      </div>
    `;
  }

  // ── Event Handlers ───────────────────────────────────────────────────────────

  @OnEvent(SHIPMENT_ACCEPTED)
  async onShipmentAccepted({ shipment }: ShipmentEvent): Promise<void> {
    const { shipper, carrier } = shipment;
    if (!shipper || !carrier) return;

    // Notify shipper: a carrier accepted their shipment
    await this.sendSafe(
      shipper.email,
      `✅ Carrier found for your shipment ${shipment.trackingNumber}`,
      this.baseTemplate(
        'Your shipment has been accepted!',
        `
        <p>Hi ${shipper.firstName},</p>
        <p>Great news! <strong>${carrier.firstName} ${carrier.lastName}</strong> has accepted your shipment and will be handling the delivery.</p>
        ${this.shipmentSummary(shipment)}
        <p style="margin-top:16px;">You will receive another update when your cargo is picked up.</p>
        `,
      ),
    );

    // Notify carrier: confirm they accepted
    await this.sendSafe(
      carrier.email,
      `📦 You accepted shipment ${shipment.trackingNumber}`,
      this.baseTemplate(
        'Shipment accepted — pickup next',
        `
        <p>Hi ${carrier.firstName},</p>
        <p>You have successfully accepted a shipment. Please proceed to pick up the cargo.</p>
        ${this.shipmentSummary(shipment)}
        <p style="margin-top:16px;"><strong>Pickup location:</strong> ${shipment.origin}</p>
        `,
      ),
    );
  }

  @OnEvent(SHIPMENT_IN_TRANSIT)
  async onShipmentInTransit({ shipment }: ShipmentEvent): Promise<void> {
    const { shipper, carrier } = shipment;
    if (!shipper || !carrier) return;

    await this.sendSafe(
      shipper.email,
      `🚚 Your shipment ${shipment.trackingNumber} is on the way`,
      this.baseTemplate(
        'Shipment picked up — in transit',
        `
        <p>Hi ${shipper.firstName},</p>
        <p>Your cargo has been picked up by <strong>${carrier.firstName} ${carrier.lastName}</strong> and is now in transit.</p>
        ${this.shipmentSummary(shipment)}
        ${shipment.estimatedDeliveryDate ? `<p style="margin-top:16px;"><strong>Estimated delivery:</strong> ${new Date(shipment.estimatedDeliveryDate).toDateString()}</p>` : ''}
        `,
      ),
    );
  }

  @OnEvent(SHIPMENT_DELIVERED)
  async onShipmentDelivered({ shipment }: ShipmentEvent): Promise<void> {
    const { shipper, carrier } = shipment;
    if (!shipper || !carrier) return;

    // Notify shipper: please confirm delivery
    await this.sendSafe(
      shipper.email,
      `📬 Your shipment ${shipment.trackingNumber} has been delivered — action required`,
      this.baseTemplate(
        'Delivery reported — please confirm',
        `
        <p>Hi ${shipper.firstName},</p>
        <p><strong>${carrier.firstName} ${carrier.lastName}</strong> has marked your shipment as delivered on <strong>${new Date().toDateString()}</strong>.</p>
        ${this.shipmentSummary(shipment)}
        <p style="margin-top:16px;">Please log in to FreightFlow to <strong>confirm delivery</strong> and complete the transaction, or raise a dispute if there is an issue.</p>
        `,
      ),
    );

    // Notify carrier: delivery marked, waiting for shipper confirmation
    await this.sendSafe(
      carrier.email,
      `✔️ Delivery marked for ${shipment.trackingNumber} — awaiting confirmation`,
      this.baseTemplate(
        'Delivery marked — awaiting shipper confirmation',
        `
        <p>Hi ${carrier.firstName},</p>
        <p>You have successfully marked shipment <strong>${shipment.trackingNumber}</strong> as delivered. The shipper has been notified and will confirm receipt shortly.</p>
        ${this.shipmentSummary(shipment)}
        `,
      ),
    );
  }

  @OnEvent(SHIPMENT_COMPLETED)
  async onShipmentCompleted({ shipment }: ShipmentEvent): Promise<void> {
    const { shipper, carrier } = shipment;
    if (!shipper || !carrier) return;

    // Notify carrier: delivery confirmed, job done
    await this.sendSafe(
      carrier.email,
      `🎉 Shipment ${shipment.trackingNumber} completed — delivery confirmed`,
      this.baseTemplate(
        'Job complete — delivery confirmed by shipper',
        `
        <p>Hi ${carrier.firstName},</p>
        <p>The shipper has confirmed receipt of shipment <strong>${shipment.trackingNumber}</strong>. This job is now complete.</p>
        ${this.shipmentSummary(shipment)}
        <p style="margin-top:16px;">Thank you for your service on FreightFlow!</p>
        `,
      ),
    );

    // Notify shipper: transaction complete
    await this.sendSafe(
      shipper.email,
      `✅ Shipment ${shipment.trackingNumber} completed successfully`,
      this.baseTemplate(
        'Shipment completed',
        `
        <p>Hi ${shipper.firstName},</p>
        <p>Your shipment <strong>${shipment.trackingNumber}</strong> has been completed successfully. Thank you for using FreightFlow!</p>
        ${this.shipmentSummary(shipment)}
        `,
      ),
    );
  }

  @OnEvent(SHIPMENT_CANCELLED)
  async onShipmentCancelled({
    shipment,
    reason,
  }: ShipmentEvent): Promise<void> {
    const { shipper, carrier } = shipment;
    const reasonNote = reason
      ? `<p><strong>Reason:</strong> ${reason}</p>`
      : '';

    if (shipper) {
      await this.sendSafe(
        shipper.email,
        `❌ Shipment ${shipment.trackingNumber} has been cancelled`,
        this.baseTemplate(
          'Shipment cancelled',
          `
          <p>Hi ${shipper.firstName},</p>
          <p>Shipment <strong>${shipment.trackingNumber}</strong> has been cancelled.</p>
          ${reasonNote}
          ${this.shipmentSummary(shipment)}
          `,
        ),
      );
    }

    if (carrier) {
      await this.sendSafe(
        carrier.email,
        `❌ Shipment ${shipment.trackingNumber} has been cancelled`,
        this.baseTemplate(
          'Shipment cancelled',
          `
          <p>Hi ${carrier.firstName},</p>
          <p>Shipment <strong>${shipment.trackingNumber}</strong> that you were assigned to has been cancelled.</p>
          ${reasonNote}
          ${this.shipmentSummary(shipment)}
          `,
        ),
      );
    }
  }

  @OnEvent(SHIPMENT_DISPUTED)
  async onShipmentDisputed({ shipment, reason }: ShipmentEvent): Promise<void> {
    const { shipper, carrier } = shipment;
    const reasonNote = reason
      ? `<p><strong>Reason for dispute:</strong> ${reason}</p>`
      : '';

    if (shipper) {
      await this.sendSafe(
        shipper.email,
        `⚠️ Dispute raised on shipment ${shipment.trackingNumber}`,
        this.baseTemplate(
          'A dispute has been raised',
          `
          <p>Hi ${shipper.firstName},</p>
          <p>A dispute has been raised on shipment <strong>${shipment.trackingNumber}</strong>. Our team will review and resolve it.</p>
          ${reasonNote}
          ${this.shipmentSummary(shipment)}
          `,
        ),
      );
    }

    if (carrier) {
      await this.sendSafe(
        carrier.email,
        `⚠️ Dispute raised on shipment ${shipment.trackingNumber}`,
        this.baseTemplate(
          'A dispute has been raised',
          `
          <p>Hi ${carrier.firstName},</p>
          <p>A dispute has been raised on shipment <strong>${shipment.trackingNumber}</strong>. Our team will review and resolve it.</p>
          ${reasonNote}
          ${this.shipmentSummary(shipment)}
          `,
        ),
      );
    }
  }

  @OnEvent(SHIPMENT_DISPUTE_RESOLVED)
  async onDisputeResolved({ shipment, reason }: ShipmentEvent): Promise<void> {
    const { shipper, carrier } = shipment;
    const outcome = shipment.status.toUpperCase();
    const reasonNote = reason
      ? `<p><strong>Resolution note:</strong> ${reason}</p>`
      : '';

    const body = (firstName: string) =>
      this.baseTemplate(
        `Dispute resolved — ${outcome}`,
        `
      <p>Hi ${firstName},</p>
      <p>The dispute on shipment <strong>${shipment.trackingNumber}</strong> has been reviewed and resolved by our admin team.</p>
      <p><strong>Outcome:</strong> ${outcome}</p>
      ${reasonNote}
      ${this.shipmentSummary(shipment)}
      `,
      );

    if (shipper) {
      await this.sendSafe(
        shipper.email,
        `🔔 Dispute resolved for shipment ${shipment.trackingNumber}`,
        body(shipper.firstName),
      );
    }
    if (carrier) {
      await this.sendSafe(
        carrier.email,
        `🔔 Dispute resolved for shipment ${shipment.trackingNumber}`,
        body(carrier.firstName),
      );
    }
  }
}
