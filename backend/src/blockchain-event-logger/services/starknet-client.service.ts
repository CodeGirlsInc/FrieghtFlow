import { Injectable, Logger, type OnModuleInit } from "@nestjs/common"
import { RpcProvider } from "starknet"
import type { StarkNetEventData } from "../interfaces/blockchain-event-logger.interface"

@Injectable()
export class StarkNetClientService implements OnModuleInit {
  private readonly logger = new Logger(StarkNetClientService.name)
  private provider: RpcProvider
  private readonly rpcUrl: string

  constructor() {
    // Use environment variable or default to testnet
    this.rpcUrl = process.env.STARKNET_RPC_URL || "https://starknet-testnet.public.blastapi.io"
  }

  async onModuleInit() {
    await this.initializeProvider()
  }

  private async initializeProvider(): Promise<void> {
    try {
      this.provider = new RpcProvider({
        nodeUrl: this.rpcUrl,
      })

      // Test connection
      const chainId = await this.provider.getChainId()
      this.logger.log(`Connected to StarkNet chain: ${chainId}`)
    } catch (error) {
      this.logger.error("Failed to initialize StarkNet provider", error)
      throw error
    }
  }

  /**
   * Get the latest block number
   */
  async getLatestBlockNumber(): Promise<bigint> {
    try {
      const block = await this.provider.getBlock("latest")
      return BigInt(block.block_number)
    } catch (error) {
      this.logger.error("Failed to get latest block number", error)
      throw error
    }
  }

  /**
   * Get events from a specific block range
   */
  async getEvents(
    contractAddress: string,
    fromBlock: bigint,
    toBlock: bigint,
    eventKeys?: string[],
  ): Promise<StarkNetEventData[]> {
    try {
      const events = await this.provider.getEvents({
        from_block: { block_number: Number(fromBlock) },
        to_block: { block_number: Number(toBlock) },
        address: contractAddress,
        keys: eventKeys ? [eventKeys] : undefined,
        chunk_size: 100,
      })

      return events.events.map((event) => ({
        transactionHash: event.transaction_hash,
        contractAddress: event.from_address,
        eventName: this.decodeEventName(event.keys[0]),
        blockNumber: BigInt(event.block_number || 0),
        blockTimestamp: new Date(), // Will be updated with actual block timestamp
        logIndex: 0, // StarkNet doesn't have log index like Ethereum
        data: event.data,
        keys: event.keys,
      }))
    } catch (error) {
      this.logger.error(`Failed to get events for contract ${contractAddress}`, error)
      throw error
    }
  }

  /**
   * Get block information including timestamp
   */
  async getBlock(blockNumber: bigint): Promise<{ timestamp: Date; number: bigint }> {
    try {
      const block = await this.provider.getBlock(Number(blockNumber))
      return {
        timestamp: new Date(block.timestamp * 1000),
        number: BigInt(block.block_number),
      }
    } catch (error) {
      this.logger.error(`Failed to get block ${blockNumber}`, error)
      throw error
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(transactionHash: string): Promise<any> {
    try {
      return await this.provider.getTransactionReceipt(transactionHash)
    } catch (error) {
      this.logger.error(`Failed to get transaction receipt for ${transactionHash}`, error)
      throw error
    }
  }

  /**
   * Decode event name from key (simplified implementation)
   */
  private decodeEventName(key: string): string {
    // This is a simplified implementation
    // In a real implementation, you would use the contract ABI to decode event names
    const eventNameMap: Record<string, string> = {
      "0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9": "delivery_confirmed",
      "0x134692b230b9e1ffa39098904722134159652b09c5bc41d88d6698779d228ff": "escrow_released",
      "0x2db340e6c609371026731f47050d3976552c89b4fbb012941663841c59d1af3": "escrow_created",
      "0x1dcde06aabdbca2f80aa51392b345d7549d7757aa855f7e37f5d335ac8243b1": "payment_processed",
      "0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e": "shipment_created",
      "0x375b6a84b32b9e0b9c8a6d3f8c4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2": "dispute_raised",
      "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5": "dispute_resolved",
    }

    return eventNameMap[key] || "unknown_event"
  }

  /**
   * Decode event data based on event type
   */
  decodeEventData(eventName: string, data: string[], keys: string[]): Record<string, any> {
    // This is a simplified implementation
    // In a real implementation, you would use the contract ABI to properly decode event data
    const decodedData: Record<string, any> = {}

    switch (eventName) {
      case "delivery_confirmed":
        decodedData.shipmentId = data[0]
        decodedData.deliveryTimestamp = data[1]
        decodedData.recipient = data[2]
        break

      case "escrow_released":
        decodedData.escrowId = data[0]
        decodedData.amount = data[1]
        decodedData.recipient = data[2]
        decodedData.releaseTimestamp = data[3]
        break

      case "escrow_created":
        decodedData.escrowId = data[0]
        decodedData.amount = data[1]
        decodedData.payer = data[2]
        decodedData.payee = data[3]
        decodedData.creationTimestamp = data[4]
        break

      case "payment_processed":
        decodedData.paymentId = data[0]
        decodedData.amount = data[1]
        decodedData.from = data[2]
        decodedData.to = data[3]
        decodedData.timestamp = data[4]
        break

      case "shipment_created":
        decodedData.shipmentId = data[0]
        decodedData.origin = data[1]
        decodedData.destination = data[2]
        decodedData.createdBy = data[3]
        decodedData.timestamp = data[4]
        break

      case "dispute_raised":
        decodedData.disputeId = data[0]
        decodedData.shipmentId = data[1]
        decodedData.raisedBy = data[2]
        decodedData.reason = data[3]
        decodedData.timestamp = data[4]
        break

      case "dispute_resolved":
        decodedData.disputeId = data[0]
        decodedData.resolution = data[1]
        decodedData.resolvedBy = data[2]
        decodedData.timestamp = data[3]
        break

      default:
        // Store raw data for unknown events
        data.forEach((item, index) => {
          decodedData[`data_${index}`] = item
        })
        keys.forEach((key, index) => {
          decodedData[`key_${index}`] = key
        })
    }

    return decodedData
  }

  /**
   * Check if the provider is connected
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.provider.getChainId()
      return true
    } catch {
      return false
    }
  }

  /**
   * Reconnect to the provider
   */
  async reconnect(): Promise<void> {
    this.logger.log("Reconnecting to StarkNet provider...")
    await this.initializeProvider()
  }
}
