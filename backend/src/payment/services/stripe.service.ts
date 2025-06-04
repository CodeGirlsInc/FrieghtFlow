import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import Stripe from "stripe"
import type { TransactionService } from "../../transaction/services/transaction.service"
import { TransactionStatus } from "../../transaction/entities/transaction.entity"
import type { WebhookService } from "../../webhook/services/webhook.service"
import { WebhookProvider } from "../../webhook/entities/webhook-event.entity"

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name)
  private readonly stripe: Stripe

  constructor(
    private readonly configService: ConfigService,
    private readonly transactionService: TransactionService,
    private readonly webhookService: WebhookService,
  ) {
    const stripeApiKey = this.configService.get<string>("STRIPE_API_KEY")
    if (!stripeApiKey) {
      throw new Error("STRIPE_API_KEY is not configured")
    }
    this.stripe = new Stripe(stripeApiKey, {
      apiVersion: "2023-10-16", // Use the latest API version
    })
  }

  async initiatePayment(paymentData: {
    paymentId: string
    userId: string
    amount: number
    currency: string
    type: string
    metadata?: Record<string, any>
  }) {
    try {
      this.logger.log(`Initiating Stripe payment: ${JSON.stringify(paymentData)}`)

      // Convert amount to cents for Stripe
      const amountInCents = Math.round(paymentData.amount * 100)

      // Create a payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: paymentData.currency.toLowerCase(),
        metadata: {
          paymentId: paymentData.paymentId,
          userId: paymentData.userId,
          type: paymentData.type,
          ...paymentData.metadata,
        },
      })

      // Update transaction with Stripe payment intent ID
      await this.transactionService.updateTransactionStatus(paymentData.paymentId, {
        status: TransactionStatus.PENDING,
        reason: "Stripe payment intent created",
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
        },
      })

      return {
        paymentId: paymentData.paymentId,
        gatewayPaymentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
        nextAction: paymentIntent.next_action,
      }
    } catch (error) {
      this.logger.error(`Error initiating Stripe payment: ${error.message}`, error.stack)
      throw error
    }
  }

  async verifyPayment(verifyData: { paymentId: string; gatewayPaymentId?: string }) {
    try {
      this.logger.log(`Verifying Stripe payment: ${JSON.stringify(verifyData)}`)

      // Get the transaction to find the Stripe payment intent ID
      const transaction = await this.transactionService.findByTransactionId(verifyData.paymentId)
      if (!transaction) {
        throw new Error(`Transaction with ID ${verifyData.paymentId} not found`)
      }

      // Get the payment intent ID from the transaction or from the verify data
      const paymentIntentId = verifyData.gatewayPaymentId || transaction.metadata?.stripePaymentIntentId

      if (!paymentIntentId) {
        throw new Error("Stripe payment intent ID not found")
      }

      // Retrieve the payment intent from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)

      // Return the payment status
      return {
        paymentId: verifyData.paymentId,
        gatewayPaymentId: paymentIntentId,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        requiresAction: paymentIntent.status === "requires_action",
        nextAction: paymentIntent.next_action,
      }
    } catch (error) {
      this.logger.error(`Error verifying Stripe payment: ${error.message}`, error.stack)
      throw error
    }
  }

  async confirmPayment(confirmData: {
    paymentId: string
    gatewayPaymentId?: string
    paymentMethodId?: string
  }) {
    try {
      this.logger.log(`Confirming Stripe payment: ${JSON.stringify(confirmData)}`)

      // Get the transaction to find the Stripe payment intent ID
      const transaction = await this.transactionService.findByTransactionId(confirmData.paymentId)
      if (!transaction) {
        throw new Error(`Transaction with ID ${confirmData.paymentId} not found`)
      }

      // Get the payment intent ID from the transaction or from the confirm data
      const paymentIntentId = confirmData.gatewayPaymentId || transaction.metadata?.stripePaymentIntentId

      if (!paymentIntentId) {
        throw new Error("Stripe payment intent ID not found")
      }

      // Confirm the payment intent if a payment method is provided
      let paymentIntent
      if (confirmData.paymentMethodId) {
        paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method: confirmData.paymentMethodId,
        })
      } else {
        // Just retrieve the payment intent if no payment method is provided
        paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
      }

      // Update transaction status based on payment intent status
      let transactionStatus: TransactionStatus
      switch (paymentIntent.status) {
        case "succeeded":
          transactionStatus = TransactionStatus.COMPLETED
          break
        case "processing":
          transactionStatus = TransactionStatus.PROCESSING
          break
        case "requires_payment_method":
        case "requires_confirmation":
        case "requires_action":
        case "requires_capture":
          transactionStatus = TransactionStatus.PENDING
          break
        case "canceled":
          transactionStatus = TransactionStatus.CANCELLED
          break
        default:
          transactionStatus = TransactionStatus.PENDING
      }

      await this.transactionService.updateTransactionStatus(confirmData.paymentId, {
        status: transactionStatus,
        reason: `Stripe payment status: ${paymentIntent.status}`,
      })

      // Return the payment status
      return {
        paymentId: confirmData.paymentId,
        gatewayPaymentId: paymentIntentId,
        status: paymentIntent.status === "succeeded" ? "completed" : paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        requiresAction: paymentIntent.status === "requires_action",
        nextAction: paymentIntent.next_action,
      }
    } catch (error) {
      this.logger.error(`Error confirming Stripe payment: ${error.message}`, error.stack)
      throw error
    }
  }

  async getPaymentStatus(paymentId: string) {
    try {
      this.logger.log(`Getting Stripe payment status for: ${paymentId}`)

      // Get the transaction to find the Stripe payment intent ID
      const transaction = await this.transactionService.findByTransactionId(paymentId)
      if (!transaction) {
        throw new Error(`Transaction with ID ${paymentId} not found`)
      }

      // Get the payment intent ID from the transaction
      const paymentIntentId = transaction.metadata?.stripePaymentIntentId

      if (!paymentIntentId) {
        throw new Error("Stripe payment intent ID not found")
      }

      // Retrieve the payment intent from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)

      // Return the payment status
      return {
        gatewayPaymentId: paymentIntentId,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        requiresAction: paymentIntent.status === "requires_action",
        nextAction: paymentIntent.next_action,
      }
    } catch (error) {
      this.logger.error(`Error getting Stripe payment status: ${error.message}`, error.stack)
      throw error
    }
  }

  async cancelPayment(paymentId: string) {
    try {
      this.logger.log(`Cancelling Stripe payment: ${paymentId}`)

      // Get the transaction to find the Stripe payment intent ID
      const transaction = await this.transactionService.findByTransactionId(paymentId)
      if (!transaction) {
        throw new Error(`Transaction with ID ${paymentId} not found`)
      }

      // Get the payment intent ID from the transaction
      const paymentIntentId = transaction.metadata?.stripePaymentIntentId

      if (!paymentIntentId) {
        throw new Error("Stripe payment intent ID not found")
      }

      // Cancel the payment intent
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId)

      // Update transaction status
      await this.transactionService.updateTransactionStatus(paymentId, {
        status: TransactionStatus.CANCELLED,
        reason: "Payment cancelled via Stripe",
      })

      return {
        paymentId,
        gatewayPaymentId: paymentIntentId,
        status: "cancelled",
      }
    } catch (error) {
      this.logger.error(`Error cancelling Stripe payment: ${error.message}`, error.stack)
      throw error
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    try {
      this.logger.log(`Refunding Stripe payment: ${paymentId}, amount: ${amount}, reason: ${reason}`)

      // Get the transaction to find the Stripe payment intent ID
      const transaction = await this.transactionService.findByTransactionId(paymentId)
      if (!transaction) {
        throw new Error(`Transaction with ID ${paymentId} not found`)
      }

      // Get the payment intent ID from the transaction
      const paymentIntentId = transaction.metadata?.stripePaymentIntentId

      if (!paymentIntentId) {
        throw new Error("Stripe payment intent ID not found")
      }

      // Retrieve the payment intent to get the charge ID
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)

      if (!paymentIntent.latest_charge) {
        throw new Error("No charge found for this payment intent")
      }

      // Convert amount to cents for Stripe if provided
      const amountInCents = amount ? Math.round(amount * 100) : undefined

      // Create the refund
      const refund = await this.stripe.refunds.create({
        charge:
          typeof paymentIntent.latest_charge === "string"
            ? paymentIntent.latest_charge
            : paymentIntent.latest_charge.id,
        amount: amountInCents,
        reason: reason
          ? reason.includes("duplicate")
            ? "duplicate"
            : reason.includes("fraudulent")
              ? "fraudulent"
              : "requested_by_customer"
          : "requested_by_customer",
        metadata: {
          paymentId,
          originalPaymentIntentId: paymentIntentId,
        },
      })

      return {
        refundId: refund.id,
        amount: refund.amount / 100, // Convert from cents
        status: refund.status,
      }
    } catch (error) {
      this.logger.error(`Error refunding Stripe payment: ${error.message}`, error.stack)
      throw error
    }
  }

  async handleWebhook(payload: any, headers: any, rawBody: Buffer) {
    try {
      this.logger.log(`Handling Stripe webhook: ${payload.type}`)

      // Process the webhook event
      const event = payload

      // Log the webhook event in the webhook module
      await this.webhookService.processWebhook({
        id: event.id,
        provider: WebhookProvider.STRIPE,
        eventType: event.type,
        payload: event,
        headers,
      })

      // Handle different event types
      switch (event.type) {
        case "payment_intent.succeeded":
          await this.handlePaymentIntentSucceeded(event.data.object)
          break
        case "payment_intent.payment_failed":
          await this.handlePaymentIntentFailed(event.data.object)
          break
        case "payment_intent.canceled":
          await this.handlePaymentIntentCanceled(event.data.object)
          break
        case "charge.refunded":
          await this.handleChargeRefunded(event.data.object)
          break
        // Add more event handlers as needed
      }

      return { received: true }
    } catch (error) {
      this.logger.error(`Error handling Stripe webhook: ${error.message}`, error.stack)
      throw error
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
      this.logger.log(`Handling payment intent succeeded: ${paymentIntent.id}`)

      // Get the payment ID from the metadata
      const paymentId = paymentIntent.metadata?.paymentId

      if (!paymentId) {
        this.logger.warn(`No payment ID found in metadata for payment intent: ${paymentIntent.id}`)
        return
      }

      // Update the transaction status
      await this.transactionService.updateTransactionStatus(paymentId, {
        status: TransactionStatus.COMPLETED,
        reason: "Payment completed via Stripe webhook",
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          stripeChargeId:
            typeof paymentIntent.latest_charge === "string"
              ? paymentIntent.latest_charge
              : paymentIntent.latest_charge?.id,
        },
      })
    } catch (error) {
      this.logger.error(`Error handling payment intent succeeded: ${error.message}`, error.stack)
      throw error
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      this.logger.log(`Handling payment intent failed: ${paymentIntent.id}`)

      // Get the payment ID from the metadata
      const paymentId = paymentIntent.metadata?.paymentId

      if (!paymentId) {
        this.logger.warn(`No payment ID found in metadata for payment intent: ${paymentIntent.id}`)
        return
      }

      // Update the transaction status
      await this.transactionService.updateTransactionStatus(paymentId, {
        status: TransactionStatus.FAILED,
        reason: `Payment failed: ${paymentIntent.last_payment_error?.message || "Unknown error"}`,
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          stripeError: paymentIntent.last_payment_error,
        },
      })
    } catch (error) {
      this.logger.error(`Error handling payment intent failed: ${error.message}`, error.stack)
      throw error
    }
  }

  private async handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
    try {
      this.logger.log(`Handling payment intent canceled: ${paymentIntent.id}`)

      // Get the payment ID from the metadata
      const paymentId = paymentIntent.metadata?.paymentId

      if (!paymentId) {
        this.logger.warn(`No payment ID found in metadata for payment intent: ${paymentIntent.id}`)
        return
      }

      // Update the transaction status
      await this.transactionService.updateTransactionStatus(paymentId, {
        status: TransactionStatus.CANCELLED,
        reason: "Payment canceled via Stripe webhook",
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
        },
      })
    } catch (error) {
      this.logger.error(`Error handling payment intent canceled: ${error.message}`, error.stack)
      throw error
    }
  }

  private async handleChargeRefunded(charge: Stripe.Charge) {
    try {
      this.logger.log(`Handling charge refunded: ${charge.id}`)

      // Get the payment intent ID from the charge
      const paymentIntentId = charge.payment_intent

      if (!paymentIntentId) {
        this.logger.warn(`No payment intent ID found for charge: ${charge.id}`)
        return
      }

      // Retrieve the payment intent to get our payment ID
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        typeof paymentIntentId === "string" ? paymentIntentId : paymentIntentId.id,
      )

      // Get the payment ID from the metadata
      const paymentId = paymentIntent.metadata?.paymentId

      if (!paymentId) {
        this.logger.warn(`No payment ID found in metadata for payment intent: ${paymentIntent.id}`)
        return
      }

      // Determine if it's a full or partial refund
      const isFullRefund = charge.amount_refunded === charge.amount

      // Update the transaction status
      await this.transactionService.updateTransactionStatus(paymentId, {
        status: isFullRefund ? TransactionStatus.REFUNDED : TransactionStatus.PARTIALLY_REFUNDED,
        reason: `Payment ${isFullRefund ? "fully" : "partially"} refunded via Stripe webhook`,
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          stripeChargeId: charge.id,
          refundAmount: charge.amount_refunded / 100, // Convert from cents
          isFullRefund,
        },
      })
    } catch (error) {
      this.logger.error(`Error handling charge refunded: ${error.message}`, error.stack)
      throw error
    }
  }
}
