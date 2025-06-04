import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import type { HttpService } from "@nestjs/axios"
import * as StellarSdk from "stellar-sdk"
import type { TransactionService } from "../../transaction/services/transaction.service"
import { TransactionStatus } from "../../transaction/entities/transaction.entity"
import type { WebhookService } from "../../webhook/services/webhook.service"
import { WebhookProvider } from "../../webhook/entities/webhook-event.entity"

@Injectable()
export class StellarService {
  private readonly logger = new Logger(StellarService.name)
  private readonly server: StellarSdk.Server
  private readonly networkPassphrase: string
  private readonly accountPublicKey: string
  private readonly accountSecretKey: string

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly transactionService: TransactionService,
    private readonly webhookService: WebhookService,
  ) {
    // Initialize Stellar SDK
    const stellarNetwork = this.configService.get<string>("STELLAR_NETWORK", "testnet")
    const isTestnet = stellarNetwork === "testnet"

    this.server = isTestnet
      ? new StellarSdk.Server("https://horizon-testnet.stellar.org")
      : new StellarSdk.Server("https://horizon.stellar.org")

    this.networkPassphrase = isTestnet ? StellarSdk.Networks.TESTNET : StellarSdk.Networks.PUBLIC

    // Get account keys
    this.accountPublicKey = this.configService.get<string>("STELLAR_PUBLIC_KEY")
    this.accountSecretKey = this.configService.get<string>("STELLAR_SECRET_KEY")

    if (!this.accountPublicKey || !this.accountSecretKey) {
      throw new Error("Stellar account keys are not configured")
    }
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
      this.logger.log(`Initiating Stellar payment: ${JSON.stringify(paymentData)}`)

      // Generate a unique memo for this payment
      const memo = StellarSdk.Memo.text(paymentData.paymentId)

      // Create a payment object with instructions
      const paymentInstructions = {
        destination: this.accountPublicKey,
        amount: paymentData.amount.toString(),
        asset: this.getAssetForCurrency(paymentData.currency),
        memo: memo.value,
      }

      // Update transaction with payment instructions
      await this.transactionService.updateTransactionStatus(paymentData.paymentId, {
        status: TransactionStatus.PENDING,
        reason: "Stellar payment initiated",
        metadata: {
          stellarPaymentInstructions: paymentInstructions,
          memo: memo.value,
        },
      })

      return {
        paymentId: paymentData.paymentId,
        instructions: paymentInstructions,
        status: "pending",
        amount: paymentData.amount,
        currency: paymentData.currency,
        memo: memo.value,
      }
    } catch (error) {
      this.logger.error(`Error initiating Stellar payment: ${error.message}`, error.stack)
      throw error
    }
  }

  async verifyPayment(verifyData: { paymentId: string; txHash?: string }) {
    try {
      this.logger.log(`Verifying Stellar payment: ${JSON.stringify(verifyData)}`)

      // Get the transaction to find the Stellar memo
      const transaction = await this.transactionService.findByTransactionId(verifyData.paymentId)
      if (!transaction) {
        throw new Error(`Transaction with ID ${verifyData.paymentId} not found`)
      }

      // If a transaction hash is provided, verify that specific transaction
      if (verifyData.txHash) {
        const stellarTx = await this.server.transactions().transaction(verifyData.txHash).call()

        // Check if this transaction is for our payment
        if (stellarTx.memo !== transaction.metadata?.memo) {
          throw new Error("Transaction memo does not match payment ID")
        }

        // Get the payment operation from the transaction
        const operations = await this.server.operations().forTransaction(verifyData.txHash).call()
        const paymentOp = operations.records.find((op) => op.type === "payment")

        if (!paymentOp) {
          throw new Error("No payment operation found in transaction")
        }

        // Check if the payment is to our account
        if (paymentOp.to !== this.accountPublicKey) {
          throw new Error("Payment is not to our account")
        }

        // Update transaction with Stellar transaction hash
        await this.transactionService.updateTransactionStatus(verifyData.paymentId, {
          status: TransactionStatus.PROCESSING,
          reason: "Stellar payment detected",
          metadata: {
            ...transaction.metadata,
            stellarTxHash: verifyData.txHash,
          },
        })

        return {
          paymentId: verifyData.paymentId,
          gatewayPaymentId: verifyData.txHash,
          status: "processing",
          amount: Number.parseFloat(paymentOp.amount),
          asset: paymentOp.asset_code || "XLM",
        }
      } else {
        // Check for payments to our account with the correct memo
        const payments = await this.server.payments().forAccount(this.accountPublicKey).limit(20).order("desc").call()

        // Find a payment with the matching memo
        for (const payment of payments.records) {
          if (payment.type !== "payment") continue

          // Get the transaction for this payment to check the memo
          const paymentTx = await this.server.transactions().transaction(payment.transaction_hash).call()

          if (paymentTx.memo === transaction.metadata?.memo) {
            // Update transaction with Stellar transaction hash
            await this.transactionService.updateTransactionStatus(verifyData.paymentId, {
              status: TransactionStatus.PROCESSING,
              reason: "Stellar payment detected",
              metadata: {
                ...transaction.metadata,
                stellarTxHash: payment.transaction_hash,
              },
            })

            return {
              paymentId: verifyData.paymentId,
              gatewayPaymentId: payment.transaction_hash,
              status: "processing",
              amount: Number.parseFloat(payment.amount),
              asset: payment.asset_code || "XLM",
            }
          }
        }

        // No matching payment found
        return {
          paymentId: verifyData.paymentId,
          status: "pending",
          message: "No matching payment found yet",
        }
      }
    } catch (error) {
      this.logger.error(`Error verifying Stellar payment: ${error.message}`, error.stack)
      throw error
    }
  }

  async confirmPayment(confirmData: { paymentId: string; txHash?: string }) {
    try {
      this.logger.log(`Confirming Stellar payment: ${JSON.stringify(confirmData)}`)

      // Get the transaction to find the Stellar transaction hash
      const transaction = await this.transactionService.findByTransactionId(confirmData.paymentId)
      if (!transaction) {
        throw new Error(`Transaction with ID ${confirmData.paymentId} not found`)
      }

      // Get the transaction hash from the confirm data or from the transaction metadata
      const txHash = confirmData.txHash || transaction.metadata?.stellarTxHash

      if (!txHash) {
        throw new Error("Stellar transaction hash not found")
      }

      // Get the transaction from Stellar
      const stellarTx = await this.server.transactions().transaction(txHash).call()

      // Check if this transaction is for our payment
      if (stellarTx.memo !== transaction.metadata?.memo) {
        throw new Error("Transaction memo does not match payment ID")
      }

      // Get the payment operation from the transaction
      const operations = await this.server.operations().forTransaction(txHash).call()
      const paymentOp = operations.records.find((op) => op.type === "payment")

      if (!paymentOp) {
        throw new Error("No payment operation found in transaction")
      }

      // Check if the payment is to our account
      if (paymentOp.to !== this.accountPublicKey) {
        throw new Error("Payment is not to our account")
      }

      // Check if the amount matches (with some tolerance for precision issues)
      const expectedAmount = Number.parseFloat(transaction.amount)
      const receivedAmount = Number.parseFloat(paymentOp.amount)

      if (Math.abs(receivedAmount - expectedAmount) > 0.0001) {
        // If amount doesn't match, still accept the payment but note the discrepancy
        await this.transactionService.updateTransactionStatus(confirmData.paymentId, {
          status: TransactionStatus.COMPLETED,
          reason: `Stellar payment completed with amount discrepancy. Expected: ${expectedAmount}, Received: ${receivedAmount}`,
          metadata: {
            ...transaction.metadata,
            stellarTxHash: txHash,
            expectedAmount,
            receivedAmount,
            amountDiscrepancy: true,
          },
        })
      } else {
        // Amount matches, mark as completed
        await this.transactionService.updateTransactionStatus(confirmData.paymentId, {
          status: TransactionStatus.COMPLETED,
          reason: "Stellar payment completed",
          metadata: {
            ...transaction.metadata,
            stellarTxHash: txHash,
          },
        })
      }

      return {
        paymentId: confirmData.paymentId,
        gatewayPaymentId: txHash,
        status: "completed",
        amount: receivedAmount,
        asset: paymentOp.asset_code || "XLM",
      }
    } catch (error) {
      this.logger.error(`Error confirming Stellar payment: ${error.message}`, error.stack)
      throw error
    }
  }

  async getPaymentStatus(paymentId: string) {
    try {
      this.logger.log(`Getting Stellar payment status for: ${paymentId}`)

      // Get the transaction to find the Stellar transaction hash
      const transaction = await this.transactionService.findByTransactionId(paymentId)
      if (!transaction) {
        throw new Error(`Transaction with ID ${paymentId} not found`)
      }

      // If we have a transaction hash, check its status
      if (transaction.metadata?.stellarTxHash) {
        const txHash = transaction.metadata.stellarTxHash

        // Get the transaction from Stellar
        const stellarTx = await this.server.transactions().transaction(txHash).call()

        // Get the payment operation from the transaction
        const operations = await this.server.operations().forTransaction(txHash).call()
        const paymentOp = operations.records.find((op) => op.type === "payment")

        if (!paymentOp) {
          return {
            status: "error",
            message: "No payment operation found in transaction",
          }
        }

        return {
          gatewayPaymentId: txHash,
          status: "completed", // If we can retrieve the transaction, it's completed on the Stellar network
          amount: Number.parseFloat(paymentOp.amount),
          asset: paymentOp.asset_code || "XLM",
        }
      } else {
        // Check if there's a payment with the correct memo
        const memo = transaction.metadata?.memo

        if (!memo) {
          return {
            status: "pending",
            message: "Waiting for payment",
          }
        }

        // Check for payments to our account with the correct memo
        const payments = await this.server.payments().forAccount(this.accountPublicKey).limit(20).order("desc").call()

        // Find a payment with the matching memo
        for (const payment of payments.records) {
          if (payment.type !== "payment") continue

          // Get the transaction for this payment to check the memo
          const paymentTx = await this.server.transactions().transaction(payment.transaction_hash).call()

          if (paymentTx.memo === memo) {
            return {
              gatewayPaymentId: payment.transaction_hash,
              status: "completed",
              amount: Number.parseFloat(payment.amount),
              asset: payment.asset_code || "XLM",
            }
          }
        }

        // No matching payment found
        return {
          status: "pending",
          message: "No matching payment found yet",
        }
      }
    } catch (error) {
      this.logger.error(`Error getting Stellar payment status: ${error.message}`, error.stack)
      throw error
    }
  }

  async cancelPayment(paymentId: string) {
    try {
      this.logger.log(`Cancelling Stellar payment: ${paymentId}`)

      // Get the transaction
      const transaction = await this.transactionService.findByTransactionId(paymentId)
      if (!transaction) {
        throw new Error(`Transaction with ID ${paymentId} not found`)
      }

      // Check if the payment has already been received
      if (transaction.metadata?.stellarTxHash) {
        throw new Error("Cannot cancel payment that has already been received")
      }

      // Update transaction status
      await this.transactionService.updateTransactionStatus(paymentId, {
        status: TransactionStatus.CANCELLED,
        reason: "Payment cancelled by user or system",
      })

      return {
        paymentId,
        status: "cancelled",
      }
    } catch (error) {
      this.logger.error(`Error cancelling Stellar payment: ${error.message}`, error.stack)
      throw error
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    try {
      this.logger.log(`Refunding Stellar payment: ${paymentId}, amount: ${amount}, reason: ${reason}`)

      // Get the transaction
      const transaction = await this.transactionService.findByTransactionId(paymentId)
      if (!transaction) {
        throw new Error(`Transaction with ID ${paymentId} not found`)
      }

      // Check if the payment has been received
      if (!transaction.metadata?.stellarTxHash) {
        throw new Error("Cannot refund payment that has not been received")
      }

      // Get the original payment details
      const txHash = transaction.metadata.stellarTxHash
      const operations = await this.server.operations().forTransaction(txHash).call()
      const paymentOp = operations.records.find((op) => op.type === "payment")

      if (!paymentOp) {
        throw new Error("No payment operation found in original transaction")
      }

      // Get the sender's account
      const senderAccount = paymentOp.from

      // Determine refund amount
      const refundAmount = amount || Number.parseFloat(transaction.amount)

      // Load the account to sign the transaction
      const sourceAccount = await this.server.loadAccount(this.accountPublicKey)

      // Create the refund transaction
      const asset = this.getAssetForCurrency(transaction.currency)
      const refundTx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: senderAccount,
            asset,
            amount: refundAmount.toString(),
          }),
        )
        .addMemo(StellarSdk.Memo.text(`Refund for ${paymentId}`))
        .setTimeout(30)
        .build()

      // Sign the transaction
      const keypair = StellarSdk.Keypair.fromSecret(this.accountSecretKey)
      refundTx.sign(keypair)

      // Submit the transaction
      const refundResult = await this.server.submitTransaction(refundTx)

      // Update transaction status
      const refundStatus =
        amount && amount < Number.parseFloat(transaction.amount)
          ? TransactionStatus.PARTIALLY_REFUNDED
          : TransactionStatus.REFUNDED

      await this.transactionService.updateTransactionStatus(paymentId, {
        status: refundStatus,
        reason: reason || "Payment refunded",
        metadata: {
          ...transaction.metadata,
          refundTxHash: refundResult.hash,
          refundAmount,
          refundReason: reason,
        },
      })

      return {
        refundId: refundResult.hash,
        amount: refundAmount,
        status: "completed",
      }
    } catch (error) {
      this.logger.error(`Error refunding Stellar payment: ${error.message}`, error.stack)
      throw error
    }
  }

  async handleWebhook(payload: any, headers: any) {
    try {
      this.logger.log(`Handling Stellar webhook: ${payload.type}`)

      // Process the webhook event
      const event = payload

      // Log the webhook event in the webhook module
      await this.webhookService.processWebhook({
        id: event.id || `stellar-${Date.now()}`,
        provider: WebhookProvider.STELLAR,
        eventType: event.type,
        payload: event,
        headers,
      })

      // Handle different event types
      switch (event.type) {
        case "payment":
          await this.handlePaymentReceived(event)
          break
        // Add more event handlers as needed
      }

      return { received: true }
    } catch (error) {
      this.logger.error(`Error handling Stellar webhook: ${error.message}`, error.stack)
      throw error
    }
  }

  private async handlePaymentReceived(event: any) {
    try {
      this.logger.log(`Handling Stellar payment received: ${JSON.stringify(event)}`)

      // Extract payment details
      const { transaction_hash, memo, amount, asset_code, from } = event

      if (!memo) {
        this.logger.warn(`No memo found in Stellar payment: ${transaction_hash}`)
        return
      }

      // Find the transaction by memo (which should be the payment ID)
      const transaction = await this.transactionService.findByTransactionId(memo)

      if (!transaction) {
        this.logger.warn(`No transaction found for memo: ${memo}`)
        return
      }

      // Check if the payment is to our account
      if (event.to !== this.accountPublicKey) {
        this.logger.warn(`Payment is not to our account: ${event.to}`)
        return
      }

      // Check if the amount matches (with some tolerance for precision issues)
      const expectedAmount = Number.parseFloat(transaction.amount)
      const receivedAmount = Number.parseFloat(amount)

      if (Math.abs(receivedAmount - expectedAmount) > 0.0001) {
        // If amount doesn't match, still accept the payment but note the discrepancy
        await this.transactionService.updateTransactionStatus(memo, {
          status: TransactionStatus.COMPLETED,
          reason: `Stellar payment completed with amount discrepancy. Expected: ${expectedAmount}, Received: ${receivedAmount}`,
          metadata: {
            ...transaction.metadata,
            stellarTxHash: transaction_hash,
            expectedAmount,
            receivedAmount,
            amountDiscrepancy: true,
            senderAccount: from,
          },
        })
      } else {
        // Amount matches, mark as completed
        await this.transactionService.updateTransactionStatus(memo, {
          status: TransactionStatus.COMPLETED,
          reason: "Stellar payment completed",
          metadata: {
            ...transaction.metadata,
            stellarTxHash: transaction_hash,
            senderAccount: from,
          },
        })
      }
    } catch (error) {
      this.logger.error(`Error handling Stellar payment received: ${error.message}`, error.stack)
      throw error
    }
  }

  private getAssetForCurrency(currency: string): StellarSdk.Asset {
    // Convert currency to uppercase
    const upperCurrency = currency.toUpperCase()

    // Handle XLM (native asset)
    if (upperCurrency === "XLM") {
      return StellarSdk.Asset.native()
    }

    // For other assets, we need an issuer
    // This is a simplified example - in a real app, you'd have a mapping of currencies to issuers
    const issuer = this.configService.get<string>(`STELLAR_${upperCurrency}_ISSUER`)

    if (!issuer) {
      throw new Error(`No issuer configured for currency: ${upperCurrency}`)
    }

    return new StellarSdk.Asset(upperCurrency, issuer)
  }
}
