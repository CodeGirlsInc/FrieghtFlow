import { Controller, Post, Get, Param, Query, Body } from "@nestjs/common"
import type { StellarService } from "./stellar.service"
import type { CreateAccountDto, SendPaymentDto, CreateEscrowDto, ReleaseEscrowDto } from "./dto"

@Controller("stellar")
export class StellarController {
  constructor(private readonly stellarService: StellarService) {}

  @Post('accounts')
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.stellarService.createAccount(createAccountDto);
  }

  @Get('accounts/:publicKey')
  async getAccountInfo(@Param('publicKey') publicKey: string) {
    return this.stellarService.getAccountInfo(publicKey);
  }

  @Get("accounts/:publicKey/balance")
  async getBalance(
    @Param('publicKey') publicKey: string,
    @Query('assetCode') assetCode?: string,
    @Query('assetIssuer') assetIssuer?: string,
  ) {
    const balance = await this.stellarService.getBalance(publicKey, assetCode, assetIssuer)
    return { balance }
  }

  @Post('payments')
  async sendPayment(@Body() sendPaymentDto: SendPaymentDto) {
    return this.stellarService.sendPayment(sendPaymentDto);
  }

  @Get('accounts/:publicKey/transactions')
  async getAccountTransactions(@Param('publicKey') publicKey: string) {
    return this.stellarService.getAccountTransactions(publicKey);
  }

  @Post('escrow')
  async createEscrow(@Body() createEscrowDto: CreateEscrowDto) {
    return this.stellarService.createEscrow(createEscrowDto);
  }

  @Post('escrow/release')
  async releaseEscrow(@Body() releaseEscrowDto: ReleaseEscrowDto) {
    return this.stellarService.releaseEscrow(releaseEscrowDto);
  }

  @Post("escrow/:escrowId/cancel")
  async cancelEscrow(@Param('escrowId') escrowId: string, @Body('cancellerSecretKey') cancellerSecretKey: string) {
    return this.stellarService.cancelEscrow(escrowId, cancellerSecretKey)
  }

  @Get('escrow/:escrowId')
  async getEscrowContract(@Param('escrowId') escrowId: string) {
    return this.stellarService.getEscrowContract(escrowId);
  }

  @Get('accounts/:publicKey/escrows')
  async getAccountEscrows(@Param('publicKey') publicKey: string) {
    return this.stellarService.getAccountEscrows(publicKey);
  }
}
