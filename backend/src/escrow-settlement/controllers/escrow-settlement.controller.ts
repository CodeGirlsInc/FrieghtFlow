import { Controller, Get, Post, Param, Query, HttpCode, HttpStatus, ParseUUIDPipe } from "@nestjs/common"
import type { EscrowSettlementService } from "../services/escrow-settlement.service"
import type { LockFundsDto } from "../dto/lock-funds.dto"
import type { ReleaseFundsDto } from "../dto/release-funds.dto"
import type { QueryEscrowTransactionDto } from "../dto/query-escrow-transaction.dto"
import type { EscrowTransaction } from "../entities/escrow-transaction.entity"

@Controller("escrow-settlement")
export class EscrowSettlementController {
  constructor(private readonly escrowSettlementService: EscrowSettlementService) {}

  @Post("lock")
  @HttpCode(HttpStatus.CREATED)
  async lockFunds(lockFundsDto: LockFundsDto): Promise<EscrowTransaction> {
    return this.escrowSettlementService.lockFunds(lockFundsDto)
  }

  @Post("release")
  @HttpCode(HttpStatus.CREATED)
  async releaseFunds(releaseFundsDto: ReleaseFundsDto): Promise<EscrowTransaction> {
    return this.escrowSettlementService.releaseFunds(releaseFundsDto)
  }

  @Post("refund/:transactionId")
  @HttpCode(HttpStatus.CREATED)
  async refundFunds(@Param("transactionId") transactionId: string): Promise<EscrowTransaction> {
    return this.escrowSettlementService.refundFunds(transactionId)
  }

  @Get("transactions")
  async findAllTransactions(
    @Query() queryDto: QueryEscrowTransactionDto,
  ): Promise<{ data: EscrowTransaction[]; total: number }> {
    return this.escrowSettlementService.findAll(queryDto)
  }

  @Get("transactions/:id")
  async findTransaction(@Param("id", ParseUUIDPipe) id: string): Promise<EscrowTransaction> {
    return this.escrowSettlementService.findOne(id)
  }

  @Get("status/:transactionId")
  async getTransactionStatus(@Param("transactionId") transactionId: string): Promise<any> {
    return this.escrowSettlementService.getTransactionStatus(transactionId)
  }

  @Post("retry/:id")
  @HttpCode(HttpStatus.OK)
  async retryTransaction(@Param("id", ParseUUIDPipe) id: string): Promise<EscrowTransaction> {
    return this.escrowSettlementService.retryFailedTransaction(id)
  }

  @Get("statistics")
  async getStatistics(): Promise<any> {
    return this.escrowSettlementService.getStatistics()
  }
}
