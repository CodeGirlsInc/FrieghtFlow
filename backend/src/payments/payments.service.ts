// #994 – Stripe checkout, webhook handler & invoice generation stubs
import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
}
export interface InvoiceResult {
  invoiceId: string;
  pdfUrl: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  createPaymentIntent(
    shipmentId: string,
    amountCents: number,
  ): Promise<PaymentIntent> {
    if (amountCents <= 0)
      throw new BadRequestException('Amount must be positive');
    this.logger.log(
      `Creating payment intent for shipment ${shipmentId}: ${amountCents} cents`,
    );
    return Promise.resolve({
      id: `pi_${Date.now()}`,
      clientSecret: `pi_${Date.now()}_secret`,
      amount: amountCents,
      currency: 'usd',
    });
  }

  handleWebhook(
    payload: string,
    signature: string,
  ): Promise<{ received: boolean }> {
    this.logger.log(`Webhook received sig=${signature.slice(0, 10)}`);
    void payload;
    return Promise.resolve({ received: true });
  }

  generateInvoice(shipmentId: string, userId: string): Promise<InvoiceResult> {
    this.logger.log(
      `Generating invoice for shipment ${shipmentId} user ${userId}`,
    );
    return Promise.resolve({
      invoiceId: `inv_${Date.now()}`,
      pdfUrl: `/invoices/${shipmentId}.pdf`,
    });
  }

  releaseEarnings(
    shipmentId: string,
    carrierId: string,
  ): Promise<{ transferred: boolean }> {
    this.logger.log(
      `Releasing earnings for shipment ${shipmentId} carrier ${carrierId}`,
    );
    return Promise.resolve({ transferred: true });
  }
}
