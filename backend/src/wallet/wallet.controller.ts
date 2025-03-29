import { Controller, Post, Body, Get, Param, ParseUUIDPipe, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"
import type { WalletService } from "./wallet.service"
import type { CreateWalletDto } from "./dto/create-wallet.dto"
import type { DepositDto } from "./dto/deposit.dto"
import type { WithdrawDto } from "./dto/withdraw.dto"
import { Wallet } from "./entities/wallet.entity"
import { Transaction } from "./entities/transaction.entity"

@ApiTags("wallets")
@Controller("wallets")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({ status: 201, description: 'Wallet created successfully', type: Wallet })
  async createWallet(@Body() createWalletDto: CreateWalletDto): Promise<Wallet> {
    return this.walletService.createWallet(createWalletDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wallet details by ID' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({ status: 200, description: 'Wallet details', type: Wallet })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getWalletById(@Param('id', ParseUUIDPipe) id: string): Promise<Wallet> {
    return this.walletService.getWalletById(id);
  }

  @Post(":id/deposit")
  @ApiOperation({ summary: "Deposit funds to a wallet" })
  @ApiParam({ name: "id", description: "Wallet ID" })
  @ApiResponse({ status: 200, description: "Deposit successful", type: Transaction })
  @ApiResponse({ status: 404, description: "Wallet not found" })
  @HttpCode(HttpStatus.OK)
  async deposit(@Param('id', ParseUUIDPipe) id: string, @Body() depositDto: DepositDto): Promise<Transaction> {
    return this.walletService.deposit(id, depositDto.amount)
  }

  @Post(":id/withdraw")
  @ApiOperation({ summary: "Withdraw funds from a wallet" })
  @ApiParam({ name: "id", description: "Wallet ID" })
  @ApiResponse({ status: 200, description: "Withdrawal successful", type: Transaction })
  @ApiResponse({ status: 400, description: "Insufficient balance" })
  @ApiResponse({ status: 404, description: "Wallet not found" })
  @HttpCode(HttpStatus.OK)
  async withdraw(@Param('id', ParseUUIDPipe) id: string, @Body() withdrawDto: WithdrawDto): Promise<Transaction> {
    return this.walletService.withdraw(id, withdrawDto.amount)
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get transaction history for a wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({ status: 200, description: 'Transaction history', type: [Transaction] })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getTransactions(@Param('id', ParseUUIDPipe) id: string): Promise<Transaction[]> {
    return this.walletService.getTransactions(id);
  }
}

