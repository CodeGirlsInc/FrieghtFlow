import { Injectable, Logger, BadRequestException, InternalServerErrorException } from "@nestjs/common"
import { Server, Keypair, TransactionBuilder, Operation, Asset, Memo, BASE_FEE } from "@stellar/stellar-sdk"
import type { StellarConfigService } from "./config/stellar-config.service"
import type { StellarAccountRepository } from "./repositories/stellar-account.repository"
import type { StellarTransactionRepository } from "./repositories/stellar-transaction.repository"
import type { EscrowContractRepository } from "./repositories/escrow-contract.repository"
import type { CreateAccountDto, SendPaymentDto, CreateEscrowDto, ReleaseEscrowDto } from "./dto"
import {
  type StellarAccountInfo,
  type PaymentResult,
  type EscrowContractData,
  EscrowStatus,
  TransactionStatus,
  AssetType,
} from "./types/stellar.types"

@Injectable()
export class StellarService {
  private readonly logger = new Logger(StellarService.name)
  private server: Server

  constructor(
    private readonly configService: StellarConfigService,
    private readonly accountRepository: StellarAccountRepository,
    private readonly transactionRepository: StellarTransactionRepository,
    private readonly escrowRepository: EscrowContractRepository,
  ) {
    this.server = new Server(this.configService.horizonUrl)
  }

  async createAccount(createAccountDto: CreateAccountDto): Promise<{ publicKey: string; secretKey: string }> {
    try {
      const keypair = Keypair.random()
      const publicKey = keypair.publicKey()
      const secretKey = keypair.secret()

      // Fund account with Friendbot if on testnet
      if (this.configService.isTestnet && createAccountDto.fundWithFriendbot) {
        await this.fundWithFriendbot(publicKey)
      }

      // Save to database
      await this.accountRepository.create({
        publicKey,
        secretKey, // In production, encrypt this
        userId: createAccountDto.userId,
      })

      this.logger.log(`Created new Stellar account: ${publicKey}`)
      return { publicKey, secretKey }
    } catch (error) {
      this.logger.error("Failed to create account", error)
      throw new InternalServerErrorException("Failed to create Stellar account")
    }
  }

  async getAccountInfo(publicKey: string): Promise<StellarAccountInfo> {
    try {
      const account = await this.server.loadAccount(publicKey)

      const accountInfo: StellarAccountInfo = {
        accountId: account.accountId(),
        sequence: account.sequenceNumber(),
        balances: account.balances,
        signers: account.signers,
        thresholds: account.thresholds,
      }

      // Update database with latest info
      await this.accountRepository.updateAccountInfo(publicKey, {
        sequence: accountInfo.sequence,
        balances: accountInfo.balances,
        signers: accountInfo.signers,
        thresholds: accountInfo.thresholds,
      })

      return accountInfo
    } catch (error) {
      this.logger.error(`Failed to get account info for ${publicKey}`, error)
      throw new BadRequestException("Account not found or invalid")
    }
  }

  async getBalance(publicKey: string, assetCode?: string, assetIssuer?: string): Promise<string> {
    try {
      const accountInfo = await this.getAccountInfo(publicKey)

      if (!assetCode) {
        // Return XLM balance
        const xlmBalance = accountInfo.balances.find((balance) => balance.asset_type === "native")
        return xlmBalance?.balance || "0"
      }

      // Return specific asset balance
      const assetBalance = accountInfo.balances.find(
        (balance) => balance.asset_code === assetCode && balance.asset_issuer === assetIssuer,
      )

      return assetBalance?.balance || "0"
    } catch (error) {
      this.logger.error(`Failed to get balance for ${publicKey}`, error)
      throw error
    }
  }

  async sendPayment(sendPaymentDto: SendPaymentDto): Promise<PaymentResult> {
    try {
      const sourceKeypair = Keypair.fromSecret(sendPaymentDto.sourceSecretKey)
      const sourceAccount = await this.server.loadAccount(sourceKeypair.publicKey())

      // Create asset
      let asset: Asset
      if (sendPaymentDto.assetType === AssetType.NATIVE || !sendPaymentDto.assetCode) {
        asset = Asset.native()
      } else {
        asset = new Asset(sendPaymentDto.assetCode, sendPaymentDto.assetIssuer)
      }

      // Build transaction
      const transactionBuilder = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.configService.networkPassphrase,
      })

      transactionBuilder.addOperation(
        Operation.payment({
          destination: sendPaymentDto.destinationPublicKey,
          asset: asset,
          amount: sendPaymentDto.amount,
        }),
      )

      if (sendPaymentDto.memo) {
        transactionBuilder.addMemo(Memo.text(sendPaymentDto.memo))
      }

      transactionBuilder.setTimeout(this.configService.timeout)
      const transaction = transactionBuilder.build()
      transaction.sign(sourceKeypair)

      // Save transaction to database
      const dbTransaction = await this.transactionRepository.create({
        transactionHash: transaction.hash().toString("hex"),
        sourceAccountId: sourceKeypair.publicKey(),
        destinationAccountId: sendPaymentDto.destinationPublicKey,
        amount: sendPaymentDto.amount,
        assetType: sendPaymentDto.assetType || AssetType.NATIVE,
        assetCode: sendPaymentDto.assetCode,
        assetIssuer: sendPaymentDto.assetIssuer,
        memo: sendPaymentDto.memo,
        status: TransactionStatus.PENDING,
      })

      // Submit transaction
      const result = await this.server.submitTransaction(transaction)

      // Update transaction status
      await this.transactionRepository.updateStatus(dbTransaction.transactionHash, TransactionStatus.SUCCESS, {
        ledger: result.ledger,
        stellarResponse: result,
      })

      this.logger.log(`Payment successful: ${result.hash}`)

      return {
        transactionHash: result.hash,
        successful: result.successful,
        ledger: result.ledger,
        createdAt: result.created_at,
      }
    } catch (error) {
      this.logger.error("Payment failed", error)

      // Update transaction status if it exists
      if (error.response?.data?.extras?.result_codes) {
        await this.transactionRepository.updateStatus(error.response.data.hash, TransactionStatus.FAILED, {
          errorMessage: error.message,
        })
      }

      throw new BadRequestException(`Payment failed: ${error.message}`)
    }
  }

  async createEscrow(createEscrowDto: CreateEscrowDto): Promise<EscrowContractData> {
    try {
      // Create escrow account
      const escrowKeypair = Keypair.random()
      const sourceKeypair = Keypair.fromSecret(createEscrowDto.sourceSecretKey)

      // Fund escrow account
      await this.fundAccount(sourceKeypair, escrowKeypair.publicKey(), "2.5") // Minimum balance + fees

      // Transfer funds to escrow
      const paymentResult = await this.sendPayment({
        sourceSecretKey: createEscrowDto.sourceSecretKey,
        destinationPublicKey: escrowKeypair.publicKey(),
        amount: createEscrowDto.amount,
        assetType: createEscrowDto.assetType,
        assetCode: createEscrowDto.assetCode,
        assetIssuer: createEscrowDto.assetIssuer,
        memo: createEscrowDto.memo,
      })

      // Create escrow contract in database
      const escrowContract = await this.escrowRepository.create({
        sourceAccountId: sourceKeypair.publicKey(),
        destinationAccountId: createEscrowDto.destinationPublicKey,
        amount: createEscrowDto.amount,
        assetType: createEscrowDto.assetType || AssetType.NATIVE,
        assetCode: createEscrowDto.assetCode,
        assetIssuer: createEscrowDto.assetIssuer,
        releaseConditions: createEscrowDto.releaseConditions,
        escrowAccountId: escrowKeypair.publicKey(),
        transactionHash: paymentResult.transactionHash,
        memo: createEscrowDto.memo,
        expiresAt: createEscrowDto.expiresAt ? new Date(createEscrowDto.expiresAt) : null,
        status: EscrowStatus.PENDING,
      })

      // Store escrow account secret (encrypted in production)
      await this.accountRepository.create({
        publicKey: escrowKeypair.publicKey(),
        secretKey: escrowKeypair.secret(),
        userId: `escrow_${escrowContract.id}`,
      })

      this.logger.log(`Escrow contract created: ${escrowContract.id}`)

      return {
        id: escrowContract.id,
        sourceAccount: escrowContract.sourceAccountId,
        destinationAccount: escrowContract.destinationAccountId,
        amount: escrowContract.amount,
        assetCode: escrowContract.assetCode,
        assetIssuer: escrowContract.assetIssuer,
        releaseConditions: escrowContract.releaseConditions,
        status: escrowContract.status,
        createdAt: escrowContract.createdAt,
        expiresAt: escrowContract.expiresAt,
      }
    } catch (error) {
      this.logger.error("Failed to create escrow", error)
      throw new InternalServerErrorException(`Failed to create escrow: ${error.message}`)
    }
  }

  async releaseEscrow(releaseEscrowDto: ReleaseEscrowDto): Promise<PaymentResult> {
    try {
      const escrowContract = await this.escrowRepository.findById(releaseEscrowDto.escrowId)
      if (!escrowContract) {
        throw new BadRequestException("Escrow contract not found")
      }

      if (escrowContract.status !== EscrowStatus.PENDING) {
        throw new BadRequestException("Escrow contract is not in pending status")
      }

      // Get escrow account
      const escrowAccount = await this.accountRepository.findByPublicKey(escrowContract.escrowAccountId)
      if (!escrowAccount) {
        throw new BadRequestException("Escrow account not found")
      }

      // Release funds to destination
      const paymentResult = await this.sendPayment({
        sourceSecretKey: escrowAccount.secretKey,
        destinationPublicKey: escrowContract.destinationAccountId,
        amount: escrowContract.amount,
        assetType: escrowContract.assetType,
        assetCode: escrowContract.assetCode,
        assetIssuer: escrowContract.assetIssuer,
        memo: `Escrow release: ${escrowContract.id}`,
      })

      // Update escrow status
      await this.escrowRepository.updateStatus(escrowContract.id, EscrowStatus.RELEASED, {
        releaseTransactionHash: paymentResult.transactionHash,
      })

      this.logger.log(`Escrow released: ${escrowContract.id}`)
      return paymentResult
    } catch (error) {
      this.logger.error("Failed to release escrow", error)
      throw error
    }
  }

  async cancelEscrow(escrowId: string, cancellerSecretKey: string): Promise<PaymentResult> {
    try {
      const escrowContract = await this.escrowRepository.findById(escrowId)
      if (!escrowContract) {
        throw new BadRequestException("Escrow contract not found")
      }

      if (escrowContract.status !== EscrowStatus.PENDING) {
        throw new BadRequestException("Escrow contract is not in pending status")
      }

      // Verify canceller is the source account
      const cancellerKeypair = Keypair.fromSecret(cancellerSecretKey)
      if (cancellerKeypair.publicKey() !== escrowContract.sourceAccountId) {
        throw new BadRequestException("Only source account can cancel escrow")
      }

      // Get escrow account
      const escrowAccount = await this.accountRepository.findByPublicKey(escrowContract.escrowAccountId)
      if (!escrowAccount) {
        throw new BadRequestException("Escrow account not found")
      }

      // Return funds to source
      const paymentResult = await this.sendPayment({
        sourceSecretKey: escrowAccount.secretKey,
        destinationPublicKey: escrowContract.sourceAccountId,
        amount: escrowContract.amount,
        assetType: escrowContract.assetType,
        assetCode: escrowContract.assetCode,
        assetIssuer: escrowContract.assetIssuer,
        memo: `Escrow cancellation: ${escrowContract.id}`,
      })

      // Update escrow status
      await this.escrowRepository.updateStatus(escrowContract.id, EscrowStatus.CANCELLED, {
        releaseTransactionHash: paymentResult.transactionHash,
      })

      this.logger.log(`Escrow cancelled: ${escrowContract.id}`)
      return paymentResult
    } catch (error) {
      this.logger.error("Failed to cancel escrow", error)
      throw error
    }
  }

  async getEscrowContract(escrowId: string): Promise<EscrowContractData> {
    const escrowContract = await this.escrowRepository.findById(escrowId)
    if (!escrowContract) {
      throw new BadRequestException("Escrow contract not found")
    }

    return {
      id: escrowContract.id,
      sourceAccount: escrowContract.sourceAccountId,
      destinationAccount: escrowContract.destinationAccountId,
      amount: escrowContract.amount,
      assetCode: escrowContract.assetCode,
      assetIssuer: escrowContract.assetIssuer,
      releaseConditions: escrowContract.releaseConditions,
      status: escrowContract.status,
      createdAt: escrowContract.createdAt,
      expiresAt: escrowContract.expiresAt,
    }
  }

  async getAccountTransactions(publicKey: string): Promise<any[]> {
    return this.transactionRepository.findByAccount(publicKey)
  }

  async getAccountEscrows(publicKey: string): Promise<EscrowContractData[]> {
    const escrows = await this.escrowRepository.findByAccount(publicKey)
    return escrows.map((escrow) => ({
      id: escrow.id,
      sourceAccount: escrow.sourceAccountId,
      destinationAccount: escrow.destinationAccountId,
      amount: escrow.amount,
      assetCode: escrow.assetCode,
      assetIssuer: escrow.assetIssuer,
      releaseConditions: escrow.releaseConditions,
      status: escrow.status,
      createdAt: escrow.createdAt,
      expiresAt: escrow.expiresAt,
    }))
  }

  private async fundWithFriendbot(publicKey: string): Promise<void> {
    if (!this.configService.isTestnet) {
      throw new BadRequestException("Friendbot is only available on testnet")
    }

    try {
      const response = await fetch(`${this.configService.friendbotUrl}?addr=${publicKey}`)
      if (!response.ok) {
        throw new Error("Friendbot funding failed")
      }
      this.logger.log(`Account funded with Friendbot: ${publicKey}`)
    } catch (error) {
      this.logger.error("Friendbot funding failed", error)
      throw new InternalServerErrorException("Failed to fund account with Friendbot")
    }
  }

  private async fundAccount(sourceKeypair: Keypair, destinationPublicKey: string, amount: string): Promise<void> {
    const sourceAccount = await this.server.loadAccount(sourceKeypair.publicKey())

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.configService.networkPassphrase,
    })
      .addOperation(
        Operation.createAccount({
          destination: destinationPublicKey,
          startingBalance: amount,
        }),
      )
      .setTimeout(this.configService.timeout)
      .build()

    transaction.sign(sourceKeypair)
    await this.server.submitTransaction(transaction)
  }
}
