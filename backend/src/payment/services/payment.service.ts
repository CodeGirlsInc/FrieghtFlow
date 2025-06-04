import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import type { StripeService } from "./stripe.service"
import type { StellarService } from "./stellar.service"
import type { PaymentVerificationService } from "./payment-verification.service"
import type { TransactionService } from "../../transaction/services/transaction.service"
import type { InitiatePaymentDto } from "../dto/initiate-payment.dto"
import type { VerifyPaymentDto } from "../dto/verify-payment.dto"
import type { ConfirmPaymentDto } from "../dto/confirm-payment.dto"
import { PaymentMethod } from "../enums/payment-method.enum"
import { TransactionStatus } from "../../transaction/entities/transaction.entity"
import { WebhookProvider } from "../../webhook/entities/webhook-event.entity"
import { v4 as uuidv4 } from "uuid"

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly stripeService: StripeService,
    private readonly stellarService: StellarService,
    private readonly paymentVerificationService: PaymentVerificationService,
    private readonly transactionService: TransactionService,
  ) {}

  async initiatePayment(initiatePaymentDto: InitiatePaymentDto) {
    this.logger.log(`Initiating payment: ${JSON.stringify(initiatePaymentDto)}`)

    const paymentId = uuidv4()
    const { userId, amount, currency, method, type, metadata } = initiatePaymentDto

    // Create a transaction record first
    const transactionData = {
      transactionId: paymentId,
      userId,
      amount,
      currency,
      status: TransactionStatus.PENDING,
      gateway: this.mapPaymentMethodToGateway(method),
      metadata: {
        ...metadata,
        paymentType: type,
      },
      description: `${type} payment via ${method}`,
      reference: metadata?.reference || paymentId,
    }

    await this.transactionService.createTransaction(transactionData)

    try {
      // Process based on payment method
      if (method === PaymentMethod.STRIPE || method === PaymentMethod.CREDIT_CARD) {
        return await this.stripeService.initiatePayment({
          paymentId,
          userId,
          amount,
          currency,
          type,
          metadata,
        })
      } else if (method === PaymentMethod.STELLAR || method === PaymentMethod.XLM || method === PaymentMethod.CRYPTO) {
        return await this.stellarService.initiatePayment({
          paymentId,
          userId,
          amount,
          currency,
          type,
          metadata,
        })
      } else {
        throw new Error(`Unsupported payment method: ${method}`)
      }
    } catch (error) {
      // Update transaction to failed if payment initiation fails
      await this.transactionService.updateTransactionStatus(paymentId, {
        status: TransactionStatus.FAILED,
        reason: error.message,
      })
      throw error
    }
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto) {
    this.logger.log(`Verifying payment: ${JSON.stringify(verifyPaymentDto)}`)

    const { paymentId, method } = verifyPaymentDto

    // Get the transaction record
    const transaction = await this.transactionService.findByTransactionId(paymentId)
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${paymentId} not found`)
    }

    try {
      // Verify based on payment method
      if (method === PaymentMethod.STRIPE || method === PaymentMethod.CREDIT_CARD) {
        return await this.stripeService.verifyPayment(verifyPaymentDto)
      } else if (method === PaymentMethod.STELLAR || method === PaymentMethod.XLM || method === PaymentMethod.CRYPTO) {
        return await this.stellarService.verifyPayment(verifyPaymentDto)
      } else {
        throw new Error(`Unsupported payment method: ${method}`)
      }
    } catch (error) {
      // Don't update transaction status here as verification might be retried
      this.logger.error(`Payment verification failed: ${error.message}`, error.stack)
      throw error
    }
  }

  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto) {
    this.logger.log(`Confirming payment: ${JSON.stringify(confirmPaymentDto)}`)

    const { paymentId, method } = confirmPaymentDto

    // Get the transaction record
    const transaction = await this.transactionService.findByTransactionId(paymentId)
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${paymentId} not found`)
    }

    try {
      // Confirm based on payment method
      let result
      if (method === PaymentMethod.STRIPE || method === PaymentMethod.CREDIT_CARD) {
        result = await this.stripeService.confirmPayment(confirmPaymentDto)
      } else if (method === PaymentMethod.STELLAR || method === PaymentMethod.XLM || method === PaymentMethod.CRYPTO) {
        result = await this.stellarService.confirmPayment(confirmPaymentDto)
      } else {
        throw new Error(`Unsupported payment method: ${method}`)
      }

      // Update transaction status based on confirmation result
      if (result.status === "succeeded" || result.status === "completed") {
        await this.transactionService.updateTransactionStatus(paymentId, {
          status: TransactionStatus.COMPLETED,
          reason: "Payment confirmed successfully",
        })
      } else if (result.status === "failed") {
        await this.transactionService.updateTransactionStatus(paymentId, {
          status: TransactionStatus.FAILED,
          reason: result.error || "Payment confirmation failed",
        })
      } else {
        await this.transactionService.updateTransactionStatus(paymentId, {
          status: TransactionStatus.PROCESSING,
          reason: "Payment is being processed",
        })
      }

      return result
    } catch (error) {
      // Update transaction to failed if confirmation fails
      await this.transactionService.updateTransactionStatus(paymentId, {
        status: TransactionStatus.FAILED,
        reason: error.message,
      })
      throw error
    }
  }

  async getPaymentStatus(paymentId: string) {
    this.logger.log(`Getting payment status for: ${paymentId}`)

    // Get the transaction record
    const transaction = await this.transactionService.findByTransactionId(paymentId)
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${paymentId} not found`)
    }

    // Determine the payment method from the transaction
    const method = this.determinePaymentMethod(transaction.gateway)

    try {
      // Get status based on payment method
      if (method === PaymentMethod.STRIPE || method === PaymentMethod.CREDIT_CARD) {
        const stripeStatus = await this.stripeService.getPaymentStatus(paymentId)
        return {
          ...transaction,
          gatewayStatus: stripeStatus,
        }
      } else if (method === PaymentMethod.STELLAR || method === PaymentMethod.XLM || method === PaymentMethod.CRYPTO) {
        const stellarStatus = await this.stellarService.getPaymentStatus(paymentId)
        return {
          ...transaction,
          gatewayStatus: stellarStatus,
        }
      } else {
        return transaction
      }
    } catch (error) {
      this.logger.error(`Error getting payment status: ${error.message}`, error.stack)
      // Return just the transaction data if we can't get gateway status
      return transaction
    }
  }

  async getPayments(filters: {
    userId?: string
    status?: string
    method?: PaymentMethod
    limit?: number
    offset?: number
  }) {
    this.logger.log(`Getting payments with filters: ${JSON.stringify(filters)}`)

    // Map payment method to gateway if provided
    let gateway
    if (filters.method) {
      gateway = this.mapPaymentMethodToGateway(filters.method)
    }

    // Use the transaction service to search for transactions
    return await this.transactionService.searchTransactions({
      userId: filters.userId,
      status: filters.status ? [filters.status as TransactionStatus] : undefined,
      gateway: gateway ? [gateway] : undefined,
      limit: filters.limit,
      offset: filters.offset,
    })
  }

  async cancelPayment(paymentId: string) {
    this.logger.log(`Cancelling payment: ${paymentId}`)

    // Get the transaction record
    const transaction = await this.transactionService.findByTransactionId(paymentId)
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${paymentId} not found`)
    }

    // Check if the transaction can be cancelled
    if (
      transaction.status === TransactionStatus.COMPLETED ||
      transaction.status === TransactionStatus.REFUNDED ||
      transaction.status === TransactionStatus.PARTIALLY_REFUNDED
    ) {
      throw new Error(`Cannot cancel payment with status: ${transaction.status}`)
    }

    // Determine the payment method from the transaction
    const method = this.determinePaymentMethod(transaction.gateway)

    try {
      // Cancel based on payment method
      if (method === PaymentMethod.STRIPE || method === PaymentMethod.CREDIT_CARD) {
        await this.stripeService.cancelPayment(paymentId)
      } else if (method === PaymentMethod.STELLAR || method === PaymentMethod.XLM || method === PaymentMethod.CRYPTO) {
        await this.stellarService.cancelPayment(paymentId)
      }

      // Update transaction status
      await this.transactionService.updateTransactionStatus(paymentId, {
        status: TransactionStatus.CANCELLED,
        reason: "Payment cancelled by user or system",
      })

      return { success: true, message: "Payment cancelled successfully" }
    } catch (error) {
      this.logger.error(`Error cancelling payment: ${error.message}`, error.stack)
      throw error
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    this.logger.log(`Refunding payment: ${paymentId}, amount: ${amount}, reason: ${reason}`)

    // Get the transaction record
    const transaction = await this.transactionService.findByTransactionId(paymentId)
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${paymentId} not found`)
    }

    // Check if the transaction can be refunded
    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new Error(`Cannot refund payment with status: ${transaction.status}`)
    }

    // Determine the payment method from the transaction
    const method = this.determinePaymentMethod(transaction.gateway)

    try {
      // Refund based on payment method
      let refundResult
      if (method === PaymentMethod.STRIPE || method === PaymentMethod.CREDIT_CARD) {
        refundResult = await this.stripeService.refundPayment(paymentId, amount, reason)
      } else if (method === PaymentMethod.STELLAR || method === PaymentMethod.XLM || method === PaymentMethod.CRYPTO) {
        refundResult = await this.stellarService.refundPayment(paymentId, amount, reason)
      } else {
        throw new Error(`Unsupported payment method for refund: ${method}`)
      }

      // Update transaction status based on refund amount
      const refundStatus =
        amount && amount < Number(transaction.amount)
          ? TransactionStatus.PARTIALLY_REFUNDED
          : TransactionStatus.REFUNDED

      await this.transactionService.updateTransactionStatus(paymentId, {
        status: refundStatus,
        reason: reason || "Payment refunded",
      })

      return {
        success: true,
        message: "Payment refunded successfully",
        refundId: refundResult.refundId,
        amount: refundResult.amount,
      }
    } catch (error) {
      this.logger.error(`Error refunding payment: ${error.message}`, error.stack)
      throw error
    }
  }

  private mapPaymentMethodToGateway(method: PaymentMethod): WebhookProvider {
    switch (method) {
      case PaymentMethod.STRIPE:
      case PaymentMethod.CREDIT_CARD:
        return WebhookProvider.STRIPE
      case PaymentMethod.STELLAR:
      case PaymentMethod.XLM:
      case PaymentMethod.CRYPTO:
        return WebhookProvider.STELLAR
      default:
        return WebhookProvider.GENERIC
    }
  }

  private determinePaymentMethod(gateway: WebhookProvider): PaymentMethod {
    switch (gateway) {
      case WebhookProvider.STRIPE:
        return PaymentMethod.STRIPE
      case WebhookProvider.STELLAR:
        return PaymentMethod.STELLAR
      default:
        return PaymentMethod.OTHER
    }
  }
}
