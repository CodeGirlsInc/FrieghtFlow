import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Payment } from "./entities/payment.entity"
import type { IPaymentProvider, CreatePaymentDto, PaymentResponseDto } from "./interfaces/payment-provider.interface"

@Injectable()
export class PaymentService {
  private providers: Map<string, IPaymentProvider> = new Map();

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) { }

  registerProvider(provider: IPaymentProvider): void {
    this.providers.set(provider.providerName, provider)
  }

  getProvider(providerName: string): IPaymentProvider {
    const provider = this.providers.get(providerName)
    if (!provider) {
      throw new Error(`Payment provider '${providerName}' not found`)
    }
    return provider
  }

  async createPayment(providerName: string, paymentData: CreatePaymentDto): Promise<PaymentResponseDto> {
    const provider = this.getProvider(providerName)
    return provider.createPayment(paymentData)
  }

  async getPayment(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } })

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`)
    }

    const provider = this.getProvider(payment.providerName)
    return provider.getPayment(paymentId)
  }

  async cancelPayment(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } })

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`)
    }

    const provider = this.getProvider(payment.providerName)
    return provider.cancelPayment(paymentId)
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } })

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`)
    }

    const provider = this.getProvider(payment.providerName)
    return provider.refundPayment(paymentId, amount)
  }

  async handleWebhook(providerName: string, payload: any, signature?: string): Promise<PaymentResponseDto> {
    const provider = this.getProvider(providerName)
    return provider.handleWebhook(payload, signature)
  }
}
