import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import { Account, Contract, RpcProvider, cairo, CallData } from "starknet"
import type {
  IStarkNetService,
  StarkNetConfig,
  ContractCallResult,
  TransactionReceipt,
  BalanceResult,
} from "../interfaces/starknet.interface"
import {
  StarkNetConnectionException,
  ContractExecutionException,
  InsufficientFundsException,
} from "../exceptions/escrow-settlement.exceptions"

@Injectable()
export class StarkNetService implements IStarkNetService {
  private readonly logger = new Logger(StarkNetService.name)
  private provider: RpcProvider
  private account: Account
  private config: StarkNetConfig

  constructor(private readonly configService: ConfigService) {
    this.initializeStarkNet()
  }

  private initializeStarkNet(): void {
    try {
      this.config = {
        rpcUrl: this.configService.get<string>("STARKNET_RPC_URL", "https://starknet-mainnet.public.blastapi.io"),
        chainId: this.configService.get<string>("STARKNET_CHAIN_ID", "SN_MAIN"),
        privateKey: this.configService.get<string>("STARKNET_PRIVATE_KEY"),
        accountAddress: this.configService.get<string>("STARKNET_ACCOUNT_ADDRESS"),
      }

      if (!this.config.privateKey || !this.config.accountAddress) {
        throw new Error("StarkNet private key and account address must be configured")
      }

      this.provider = new RpcProvider({
        nodeUrl: this.config.rpcUrl,
      })

      this.account = new Account(this.provider, this.config.accountAddress, this.config.privateKey)

      this.logger.log("StarkNet service initialized successfully")
    } catch (error) {
      this.logger.error(`Failed to initialize StarkNet service: ${error.message}`, error.stack)
      throw new StarkNetConnectionException(`Initialization failed: ${error.message}`)
    }
  }

  async lockFunds(
    contractAddress: string,
    transactionId: string,
    amount: string,
    senderAddress: string,
    recipientAddress: string,
  ): Promise<ContractCallResult> {
    this.logger.log(`Locking funds: ${amount} for transaction ${transactionId}`)

    try {
      // Check balance before locking
      const balance = await this.getBalance(senderAddress)
      if (BigInt(balance.balance) < BigInt(amount)) {
        throw new InsufficientFundsException(senderAddress, amount, balance.balance)
      }

      const contract = new Contract(this.getEscrowABI(), contractAddress, this.provider)
      contract.connect(this.account)

      const callData = CallData.compile({
        transaction_id: cairo.felt(transactionId),
        amount: cairo.uint256(amount),
        sender: cairo.felt(senderAddress),
        recipient: cairo.felt(recipientAddress),
      })

      const result = await contract.lock_funds(callData)

      this.logger.log(`Funds locked successfully. TX Hash: ${result.transaction_hash}`)

      return {
        transaction_hash: result.transaction_hash,
        execution_status: "PENDING",
        finality_status: "RECEIVED",
      }
    } catch (error) {
      this.logger.error(`Failed to lock funds: ${error.message}`, error.stack)
      throw new ContractExecutionException(`Lock funds failed: ${error.message}`)
    }
  }

  async releaseFunds(
    contractAddress: string,
    transactionId: string,
    recipientAddress: string,
  ): Promise<ContractCallResult> {
    this.logger.log(`Releasing funds for transaction ${transactionId} to ${recipientAddress}`)

    try {
      const contract = new Contract(this.getEscrowABI(), contractAddress, this.provider)
      contract.connect(this.account)

      const callData = CallData.compile({
        transaction_id: cairo.felt(transactionId),
        recipient: cairo.felt(recipientAddress),
      })

      const result = await contract.release_funds(callData)

      this.logger.log(`Funds released successfully. TX Hash: ${result.transaction_hash}`)

      return {
        transaction_hash: result.transaction_hash,
        execution_status: "PENDING",
        finality_status: "RECEIVED",
      }
    } catch (error) {
      this.logger.error(`Failed to release funds: ${error.message}`, error.stack)
      throw new ContractExecutionException(`Release funds failed: ${error.message}`)
    }
  }

  async refundFunds(
    contractAddress: string,
    transactionId: string,
    senderAddress: string,
  ): Promise<ContractCallResult> {
    this.logger.log(`Refunding funds for transaction ${transactionId} to ${senderAddress}`)

    try {
      const contract = new Contract(this.getEscrowABI(), contractAddress, this.provider)
      contract.connect(this.account)

      const callData = CallData.compile({
        transaction_id: cairo.felt(transactionId),
        sender: cairo.felt(senderAddress),
      })

      const result = await contract.refund_funds(callData)

      this.logger.log(`Funds refunded successfully. TX Hash: ${result.transaction_hash}`)

      return {
        transaction_hash: result.transaction_hash,
        execution_status: "PENDING",
        finality_status: "RECEIVED",
      }
    } catch (error) {
      this.logger.error(`Failed to refund funds: ${error.message}`, error.stack)
      throw new ContractExecutionException(`Refund funds failed: ${error.message}`)
    }
  }

  async getTransactionReceipt(txHash: string): Promise<TransactionReceipt> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash)

      return {
        transaction_hash: receipt.transaction_hash,
        block_number: receipt.block_number,
        block_hash: receipt.block_hash,
        execution_status: receipt.execution_status as "SUCCEEDED" | "REVERTED",
        finality_status: receipt.finality_status as "ACCEPTED_ON_L2" | "ACCEPTED_ON_L1",
        gas_consumed: receipt.actual_fee?.toString() || "0",
        gas_price: "1", // StarkNet uses different fee structure
        events: receipt.events || [],
      }
    } catch (error) {
      this.logger.error(`Failed to get transaction receipt: ${error.message}`)
      throw new StarkNetConnectionException(`Get receipt failed: ${error.message}`)
    }
  }

  async getBalance(address: string, tokenAddress?: string): Promise<BalanceResult> {
    try {
      if (tokenAddress) {
        // ERC20 token balance
        const contract = new Contract(this.getERC20ABI(), tokenAddress, this.provider)
        const result = await contract.balanceOf(address)
        const decimals = await contract.decimals()
        const symbol = await contract.symbol()

        return {
          balance: result.balance.toString(),
          decimals: Number(decimals),
          symbol: symbol,
        }
      } else {
        // ETH balance
        const balance = await this.provider.getBalance(address)
        return {
          balance: balance.toString(),
          decimals: 18,
          symbol: "ETH",
        }
      }
    } catch (error) {
      this.logger.error(`Failed to get balance: ${error.message}`)
      throw new StarkNetConnectionException(`Get balance failed: ${error.message}`)
    }
  }

  async isTransactionConfirmed(txHash: string): Promise<boolean> {
    try {
      const receipt = await this.getTransactionReceipt(txHash)
      return (
        receipt.execution_status === "SUCCEEDED" &&
        (receipt.finality_status === "ACCEPTED_ON_L2" || receipt.finality_status === "ACCEPTED_ON_L1")
      )
    } catch (error) {
      this.logger.warn(`Could not check transaction confirmation: ${error.message}`)
      return false
    }
  }

  private getEscrowABI(): any[] {
    // Simplified escrow contract ABI
    return [
      {
        name: "lock_funds",
        type: "function",
        inputs: [
          { name: "transaction_id", type: "felt" },
          { name: "amount", type: "Uint256" },
          { name: "sender", type: "felt" },
          { name: "recipient", type: "felt" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "release_funds",
        type: "function",
        inputs: [
          { name: "transaction_id", type: "felt" },
          { name: "recipient", type: "felt" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "refund_funds",
        type: "function",
        inputs: [
          { name: "transaction_id", type: "felt" },
          { name: "sender", type: "felt" },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        name: "get_escrow_details",
        type: "function",
        inputs: [{ name: "transaction_id", type: "felt" }],
        outputs: [
          { name: "amount", type: "Uint256" },
          { name: "sender", type: "felt" },
          { name: "recipient", type: "felt" },
          { name: "is_locked", type: "bool" },
        ],
        state_mutability: "view",
      },
    ]
  }

  private getERC20ABI(): any[] {
    return [
      {
        name: "balanceOf",
        type: "function",
        inputs: [{ name: "account", type: "felt" }],
        outputs: [{ name: "balance", type: "Uint256" }],
        state_mutability: "view",
      },
      {
        name: "decimals",
        type: "function",
        inputs: [],
        outputs: [{ name: "decimals", type: "felt" }],
        state_mutability: "view",
      },
      {
        name: "symbol",
        type: "function",
        inputs: [],
        outputs: [{ name: "symbol", type: "felt" }],
        state_mutability: "view",
      },
    ]
  }
}
