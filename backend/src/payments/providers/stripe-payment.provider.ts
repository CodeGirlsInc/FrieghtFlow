import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import Stripe from "stripe"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import {
  type IPaymentProvider,
  type CreatePaymentDto,
  type PaymentResponseDto,
  PaymentStatus,
} from "../interfaces/payment-provider.interface"
import { Payment } from "../entities/payment.entity"

@Injectable()
export class StripePaymentProvider implements IPaymentProvider {
  private readonly stripe: Stripe
  private readonly logger = new Logger(StripePaymentProvider.name)
  readonly providerName = "stripe";

  constructor(
    private configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPayment(paymentData: CreatePaymentDto): Promise<PaymentResponseDto> {
    try {
      const { amount, currency, description, metadata, returnUrl, customerId } = paymentData

      // Create a payment intent with Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses cents
        currency: currency.toLowerCase(),
        description,
        metadata,
        ...(customerId && { customer: customerId }),
        automatic_payment_methods: {
          enabled: true,
        },
      })

      // Save the payment record to our database
      const payment = this.paymentRepository.create({
        providerName: this.providerName,
        providerPaymentId: paymentIntent.id,
        amount,
        currency,
        status: this.mapStripeStatusToPaymentStatus(paymentIntent.status),
        metadata,
        providerData: {
          clientSecret: paymentIntent.client_secret,
          paymentMethodTypes: paymentIntent.payment_method_types,
        },
        customerId,
      })

      await this.paymentRepository.save(payment)

      return {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        metadata: payment.metadata,
        providerData: {
          clientSecret: paymentIntent.client_secret,
        },
        redirectUrl: returnUrl,
      }
    } catch (error) {
      this.logger.error(`Failed to create Stripe payment: ${error.message}`, error.stack)
      throw error
    }
  }

  async getPayment(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } })

    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`)
    }

    // Get the latest status from Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(payment.providerPaymentId)

    // Update our record if the status has changed
    const stripeStatus = this.mapStripeStatusToPaymentStatus(paymentIntent.status)
    if (payment.status !== stripeStatus) {
      payment.status = stripeStatus
      payment.providerData = {
        ...payment.providerData,
        lastStatus: paymentIntent.status,
      }
      await this.paymentRepository.save(payment)
    }

    return {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      metadata: payment.metadata,
      providerData: payment.providerData,
      redirectUrl: payment.redirectUrl,
    }
  }

  async cancelPayment(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } })

    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`)
    }

    await this.stripe.paymentIntents.cancel(payment.providerPaymentId)

    payment.status = PaymentStatus.CANCELED
    await this.paymentRepository.save(payment)

    return {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      metadata: payment.metadata,
      providerData: payment.providerData,
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } })

    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`)
    }

    // Get payment intent to find the charge ID
    const paymentIntent = await this.stripe.paymentIntents.retrieve(payment.providerPaymentId)

    if (!paymentIntent.latest_charge) {
      throw new Error("No charge found for this payment")
    }

    // Create refund
    const refundParams: Stripe.RefundCreateParams = {
      charge: paymentIntent.latest_charge as string,
    }

    if (amount) {
      refundParams.amount = Math.round(amount * 100)
    }

    await this.stripe.refunds.create(refundParams)

    payment.status = PaymentStatus.REFUNDED
    await this.paymentRepository.save(payment)

    return {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      metadata: payment.metadata,
      providerData: payment.providerData,
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<PaymentResponseDto> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get<string>("STRIPE_WEBHOOK_SECRET"),
      )

      let paymentIntent: Stripe.PaymentIntent

      switch (event.type) {
        case "payment_intent.succeeded":
        case "payment_intent.processing":
        case "payment_intent.payment_failed":
        case "payment_intent.canceled":
          paymentIntent = event.data.object as Stripe.PaymentIntent
          break
        default:
          this.logger.log(`Unhandled event type: ${event.type}`)
          return null
      }

      // Find our payment record
      const payment = await this.paymentRepository.findOne({
        where: { providerPaymentId: paymentIntent.id },
      })

      if (!payment) {
        this.logger.warn(`Payment not found for Stripe payment intent: ${paymentIntent.id}`)
        return null
      }

      // Update payment status
      payment.status = this.mapStripeStatusToPaymentStatus(paymentIntent.status)
      payment.providerData = {
        ...payment.providerData,
        lastWebhookEvent: event.type,
        lastStatus: paymentIntent.status,
      }

      await this.paymentRepository.save(payment)

      return {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        metadata: payment.metadata,
        providerData: payment.providerData,
      }
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`, error.stack)
      throw error
    }
  }

  private mapStripeStatusToPaymentStatus(stripeStatus: string): PaymentStatus {
    switch (stripeStatus) {
      case "requires_payment_method":
      case "requires_confirmation":
      case "requires_action":
      case "requires_capture":
        return PaymentStatus.PENDING
      case "processing":
        return PaymentStatus.PROCESSING
      case "succeeded":
        return PaymentStatus.SUCCEEDED
      case "canceled":
        return PaymentStatus.CANCELED
      default:
        return PaymentStatus.FAILED
    }
  }
}
