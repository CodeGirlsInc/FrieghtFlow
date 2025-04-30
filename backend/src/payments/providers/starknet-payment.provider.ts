import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Account, Contract, Provider, json, stark, uint256 } from "starknet"
import {
  type IPaymentProvider,
  type CreatePaymentDto,
  type PaymentResponseDto,
  PaymentStatus,
} from "../interfaces/payment-provider.interface"
import { Payment } from "../entities/payment.entity"

@Injectable()
export class StarknetPaymentProvider implements IPaymentProvider {
  private readonly provider: Provider
  private readonly account: Account
  private readonly usdcContract: Contract
  private readonly logger = new Logger(StarknetPaymentProvider.name)
  readonly providerName = "starknet";

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {
    // Initialize StarkNet provider
    this.provider = new Provider({
      sequencer: {
        network: this.configService.get('STARKNET_NETWORK', 'goerli-alpha'),
      },
    });

    // Initialize account
    const privateKey = this.configService.get<string>('STARKNET_PRIVATE_KEY');
    const accountAddress = this.configService.get<string>('STARKNET_ACCOUNT_ADDRESS');
    
    this.account = new Account(
      this.provider,
      accountAddress,
      privateKey,
    );

    // Initialize USDC contract
    const usdcContractAddress = this.configService.get<string>('STARKNET_USDC_CONTRACT_ADDRESS');
    const usdcContractAbi = json.parse(this.configService.get<string>('STARKNET_USDC_CONTRACT_ABI'));
    
    this.usdcContract = new Contract(usdcContractAbi, usdcContractAddress, this.provider);
    this.usdcContract.connect(this.account);
  }

  async createPayment(paymentData: CreatePaymentDto): Promise<PaymentResponseDto> {
    try {
      const { amount, currency, metadata, customerId } = paymentData

      if (currency.toUpperCase() !== "USDC") {
        throw new Error("StarkNet provider only supports USDC currency")
      }

      // Generate a unique payment ID
      const paymentId = stark.randomAddress()

      // Create a payment record in our database
      const payment = this.paymentRepository.create({
        providerName: this.providerName,
        providerPaymentId: paymentId,
        amount,
        currency: "USDC",
        status: PaymentStatus.PENDING,
        metadata: {
          ...metadata,
          receiverAddress: this.account.address,
        },
        providerData: {
          paymentId,
          receiverAddress: this.account.address,
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
          paymentId,
          receiverAddress: this.account.address,
        },
      }
    } catch (error) {
      this.logger.error(`Failed to create StarkNet payment: ${error.message}`, error.stack)
      throw error
    }
  }

  async getPayment(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } })

    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`)
    }

    // For StarkNet, we would typically check the blockchain for transaction status
    // This is a simplified version - in a real implementation, you would check the transaction status

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

  async cancelPayment(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } })

    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`)
    }

    // For crypto payments, cancellation might not be possible if the transaction is already on the blockchain
    // We can only mark it as canceled in our system if it's still pending

    if (payment.status === PaymentStatus.PENDING) {
      payment.status = PaymentStatus.CANCELED
      await this.paymentRepository.save(payment)
    } else {
      throw new Error("Cannot cancel a payment that is not in pending status")
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
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } })

    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`)
    }

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new Error("Can only refund successful payments")
    }

    const refundAmount = amount || payment.amount

    // In a real implementation, you would initiate a transfer back to the customer's wallet
    // This is a simplified version

    try {
      // Get the customer's wallet address from metadata
      const customerAddress = payment.metadata?.customerAddress

      if (!customerAddress) {
        throw new Error("Customer address not found in payment metadata")
      }

      // Convert amount to uint256 format required by StarkNet
      const amountUint256 = uint256.bnToUint256(Math.floor(refundAmount * 1000000)) // Assuming 6 decimals for USDC

      // Execute the transfer
      const { transaction_hash } = await this.usdcContract.transfer(customerAddress, amountUint256)

      // Update payment status
      payment.status = PaymentStatus.REFUNDED
      payment.providerData = {
        ...payment.providerData,
        refundTransactionHash: transaction_hash,
        refundAmount: refundAmount,
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
      this.logger.error(`Failed to refund StarkNet payment: ${error.message}`, error.stack)
      throw error
    }
  }

  async handleWebhook(payload: any): Promise<PaymentResponseDto> {
    try {
      // For StarkNet, we might receive notifications from an indexer or oracle service
      // This is a simplified implementation

      const { paymentId, transactionHash, status } = payload

      // Find our payment record
      const payment = await this.paymentRepository.findOne({
        where: { providerPaymentId: paymentId },
      })

      if (!payment) {
        this.logger.warn(`Payment not found for StarkNet payment ID: ${paymentId}`)
        return null
      }

      // Update payment status based on the webhook data
      payment.status = this.mapStarkNetStatusToPaymentStatus(status)
      payment.providerData = {
        ...payment.providerData,
        transactionHash,
        lastStatus: status,
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

  private mapStarkNetStatusToPaymentStatus(starkNetStatus: string): PaymentStatus {
    switch (starkNetStatus) {
      case "RECEIVED":
      case "PENDING":
        return PaymentStatus.PENDING
      case "ACCEPTED_ON_L2":
        return PaymentStatus.PROCESSING
      case "ACCEPTED_ON_L1":
        return PaymentStatus.SUCCEEDED
      case "REJECTED":
        return PaymentStatus.FAILED
      default:
        return PaymentStatus.PENDING
    }
  }
}
