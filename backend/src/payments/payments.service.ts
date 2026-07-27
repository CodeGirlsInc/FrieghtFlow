import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY', ''),
      { apiVersion: '2025-06-30.basil' as Stripe.LatestApiVersion },
    );
  }

  async createCheckoutSession(
    shipmentId: string,
    userId: string,
  ): Promise<{ sessionId: string; url: string }> {
    const invoice = await this.invoiceRepo.findOne({
      where: { shipmentId, status: InvoiceStatus.PAID },
    });
    if (invoice) {
      throw new BadRequestException('Shipment already paid');
    }

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `FreightFlow Shipment — ${shipmentId}`,
            },
            unit_amount: 5000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payments/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        shipmentId,
        userId,
      },
    });

    let existingInvoice = await this.invoiceRepo.findOne({
      where: { shipmentId },
    });
    if (!existingInvoice) {
      existingInvoice = this.invoiceRepo.create({
        shipmentId,
        amount: 50,
        status: InvoiceStatus.PENDING,
        stripeSessionId: session.id,
      });
    } else {
      existingInvoice.stripeSessionId = session.id;
    }
    await this.invoiceRepo.save(existingInvoice);

    return { sessionId: session.id, url: session.url! };
  }

  async handleWebhook(event: Stripe.Event): Promise<{ received: boolean }> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const shipmentId = session.metadata?.shipmentId;
        if (!shipmentId) {
          this.logger.warn('Webhook missing shipmentId metadata');
          break;
        }

        const invoice = await this.invoiceRepo.findOne({
          where: { shipmentId },
        });
        if (invoice) {
          invoice.status = InvoiceStatus.PAID;
          invoice.stripePaymentIntentId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : null;
          await this.invoiceRepo.save(invoice);
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object;
        const shipmentId = session.metadata?.shipmentId;
        if (shipmentId) {
          const invoice = await this.invoiceRepo.findOne({
            where: { shipmentId },
          });
          if (invoice && invoice.status === InvoiceStatus.PENDING) {
            invoice.status = InvoiceStatus.FAILED;
            await this.invoiceRepo.save(invoice);
          }
        }
        break;
      }
    }

    return { received: true };
  }

  async getInvoice(shipmentId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { shipmentId },
    });
    if (!invoice) {
      throw new NotFoundException(
        `Invoice for shipment ${shipmentId} not found`,
      );
    }
    return invoice;
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    )!;
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
