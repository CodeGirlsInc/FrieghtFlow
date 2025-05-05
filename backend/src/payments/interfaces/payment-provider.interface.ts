export interface PaymentMethodDto {
  type: string
  [key: string]: any
}

export interface CreatePaymentDto {
  amount: number
  currency: string
  description?: string
  metadata?: Record<string, any>
  paymentMethod?: PaymentMethodDto
  returnUrl?: string
  customerId?: string
}

export interface PaymentResponseDto {
  id: string
  status: PaymentStatus
  amount: number
  currency: string
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
  providerData?: Record<string, any>
  redirectUrl?: string
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  CANCELED = "canceled",
  REFUNDED = "refunded",
}

export interface IPaymentProvider {
  readonly providerName: string

  createPayment(paymentData: CreatePaymentDto): Promise<PaymentResponseDto>
  getPayment(paymentId: string): Promise<PaymentResponseDto>
  cancelPayment(paymentId: string): Promise<PaymentResponseDto>
  refundPayment(paymentId: string, amount?: number): Promise<PaymentResponseDto>
  handleWebhook(payload: any, signature?: string): Promise<PaymentResponseDto>
}
