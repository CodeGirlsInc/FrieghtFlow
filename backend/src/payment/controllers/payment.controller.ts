import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
  Query,
} from "@nestjs/common"
import { ApiKeyGuard } from "../../common/guards/api-key.guard"
import type { PaymentService } from "../services/payment.service"
import type { InitiatePaymentDto } from "../dto/initiate-payment.dto"
import type { VerifyPaymentDto } from "../dto/verify-payment.dto"
import type { ConfirmPaymentDto } from "../dto/confirm-payment.dto"
import type { PaymentMethod } from "../enums/payment-method.enum"

@Controller("payments")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("initiate")
  async initiatePayment(@Body() initiatePaymentDto: InitiatePaymentDto) {
    try {
      return await this.paymentService.initiatePayment(initiatePaymentDto)
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  @Post("verify")
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    try {
      return await this.paymentService.verifyPayment(verifyPaymentDto)
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  @Post("confirm")
  async confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
    try {
      return await this.paymentService.confirmPayment(confirmPaymentDto)
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  @Get(":id")
  async getPaymentStatus(@Param("id") id: string) {
    try {
      const payment = await this.paymentService.getPaymentStatus(id)
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${id} not found`)
      }
      return payment
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }

  @Get()
  @UseGuards(ApiKeyGuard)
  async getPayments(
    @Query("userId") userId?: string,
    @Query("status") status?: string,
    @Query("method") method?: PaymentMethod,
    @Query("limit") limit = 20,
    @Query("offset") offset = 0,
  ) {
    try {
      return await this.paymentService.getPayments({
        userId,
        status,
        method,
        limit,
        offset,
      })
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  @Post(":id/cancel")
  @UseGuards(ApiKeyGuard)
  async cancelPayment(@Param("id") id: string) {
    try {
      return await this.paymentService.cancelPayment(id)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }

  @Post(":id/refund")
  @UseGuards(ApiKeyGuard)
  async refundPayment(@Param("id") id: string, @Body() refundData: { amount?: number; reason?: string }) {
    try {
      return await this.paymentService.refundPayment(id, refundData.amount, refundData.reason)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(error.message)
    }
  }
}
