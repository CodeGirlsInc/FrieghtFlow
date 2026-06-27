import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './entities/bid.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { User } from '../users/entities/user.entity';
import { BID_COUNTERED, BID_COUNTER_DECLINED } from './bids.service';

interface BidEvent {
  bid: Bid;
  shipment: Shipment;
}

@Injectable()
export class BidsNotificationsService {
  private readonly logger = new Logger(BidsNotificationsService.name);

  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(Bid)
    private readonly bidRepo: Repository<Bid>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  private async sendSafe(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({ to, subject, html });
    } catch (err: unknown) {
      this.logger.warn(
        `Failed to send email to ${to}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private wrap(title: string, body: string): string {
    return `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#1e40af;margin-bottom:16px;">${title}</h2>
        ${body}
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
        <p style="color:#9ca3af;font-size:12px;">FreightFlow — Decentralized Freight Management</p>
      </div>`;
  }

  private async loadRelations(
    bid: Bid,
    shipment: Shipment,
  ): Promise<{ carrier: User | null; shipper: User | null }> {
    const fullShipment = await this.shipmentRepo.findOne({
      where: { id: shipment.id },
      relations: ['shipper'],
    });
    const fullBid = await this.bidRepo.findOne({
      where: { id: bid.id },
      relations: ['carrier'],
    });
    return {
      carrier: fullBid?.carrier ?? null,
      shipper: fullShipment?.shipper ?? null,
    };
  }

  @OnEvent(BID_COUNTERED)
  async onBidCountered({ bid, shipment }: BidEvent): Promise<void> {
    const { carrier } = await this.loadRelations(bid, shipment);
    if (!carrier) return;

    await this.sendSafe(
      carrier.email,
      `💬 New counteroffer on your bid`,
      this.wrap(
        'Shipper made a counteroffer',
        `<p>Hi ${carrier.firstName},</p>
         <p>The shipper has made a counteroffer of <strong>$${bid.counterPrice}</strong> on your bid.</p>
         ${bid.counterMessage ? `<p><strong>Message:</strong> ${bid.counterMessage}</p>` : ''}
         <p>Log in to FreightFlow to accept or decline this counteroffer.</p>`,
      ),
    );
  }

  @OnEvent(BID_COUNTER_DECLINED)
  async onCounterDeclined({ bid, shipment }: BidEvent): Promise<void> {
    const { shipper } = await this.loadRelations(bid, shipment);
    if (!shipper) return;

    await this.sendSafe(
      shipper.email,
      `❌ Carrier declined your counteroffer`,
      this.wrap(
        'Counteroffer declined',
        `<p>Hi ${shipper.firstName},</p>
         <p>The carrier has declined your counteroffer of <strong>$${bid.counterPrice}</strong>.</p>
         <p>You may review other bids on your shipment.</p>`,
      ),
    );
  }
}
