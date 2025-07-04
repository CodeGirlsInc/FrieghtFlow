import { Test, type TestingModule } from "@nestjs/testing"
import { StarkNetClientService } from "../services/starknet-client.service"
import { jest } from "@jest/globals"

// Mock StarkNet provider
const mockProvider = {
  getChainId: jest.fn(),
  getBlock: jest.fn(),
  getEvents: jest.fn(),
  getTransactionReceipt: jest.fn(),
}

jest.mock("starknet", () => ({
  RpcProvider: jest.fn().mockImplementation(() => mockProvider),
}))

describe("StarkNetClientService", () => {
  let service: StarkNetClientService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StarkNetClientService],
    }).compile()

    service = module.get<StarkNetClientService>(StarkNetClientService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("getLatestBlockNumber", () => {
    it("should return the latest block number", async () => {
      const mockBlock = { block_number: 12345 }
      mockProvider.getBlock.mockResolvedValue(mockBlock)

      const result = await service.getLatestBlockNumber()

      expect(result).toBe(BigInt(12345))
      expect(mockProvider.getBlock).toHaveBeenCalledWith("latest")
    })

    it("should handle errors when getting latest block", async () => {
      mockProvider.getBlock.mockRejectedValue(new Error("Network error"))

      await expect(service.getLatestBlockNumber()).rejects.toThrow("Network error")
    })
  })

  describe("getEvents", () => {
    it("should return formatted events", async () => {
      const mockEvents = {
        events: [
          {
            transaction_hash: "0x123",
            from_address: "0x456",
            keys: ["0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9"],
            data: ["0x789", "0xabc"],
            block_number: 12345,
          },
        ],
      }

      mockProvider.getEvents.mockResolvedValue(mockEvents)

      const result = await service.getEvents("0x456", BigInt(12340), BigInt(12350))

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        transactionHash: "0x123",
        contractAddress: "0x456",
        eventName: "delivery_confirmed",
        blockNumber: BigInt(12345),
        data: ["0x789", "0xabc"],
      })
    })

    it("should handle empty events response", async () => {
      mockProvider.getEvents.mockResolvedValue({ events: [] })

      const result = await service.getEvents("0x456", BigInt(12340), BigInt(12350))

      expect(result).toHaveLength(0)
    })
  })

  describe("getBlock", () => {
    it("should return block information with timestamp", async () => {
      const mockBlock = {
        block_number: 12345,
        timestamp: 1640995200, // Unix timestamp
      }

      mockProvider.getBlock.mockResolvedValue(mockBlock)

      const result = await service.getBlock(BigInt(12345))

      expect(result.number).toBe(BigInt(12345))
      expect(result.timestamp).toBeInstanceOf(Date)
      expect(result.timestamp.getTime()).toBe(1640995200 * 1000)
    })
  })

  describe("decodeEventData", () => {
    it("should decode delivery_confirmed event", () => {
      const result = service.decodeEventData("delivery_confirmed", ["0x123", "1640995200", "0x456"], [])

      expect(result).toEqual({
        shipmentId: "0x123",
        deliveryTimestamp: "1640995200",
        recipient: "0x456",
      })
    })

    it("should decode escrow_released event", () => {
      const result = service.decodeEventData("escrow_released", ["0x123", "1000", "0x456", "1640995200"], [])

      expect(result).toEqual({
        escrowId: "0x123",
        amount: "1000",
        recipient: "0x456",
        releaseTimestamp: "1640995200",
      })
    })

    it("should handle unknown events", () => {
      const result = service.decodeEventData("unknown_event", ["0x123", "0x456"], ["0x789"])

      expect(result).toEqual({
        data_0: "0x123",
        data_1: "0x456",
        key_0: "0x789",
      })
    })
  })

  describe("isConnected", () => {
    it("should return true when connected", async () => {
      mockProvider.getChainId.mockResolvedValue("SN_MAIN")

      const result = await service.isConnected()

      expect(result).toBe(true)
    })

    it("should return false when not connected", async () => {
      mockProvider.getChainId.mockRejectedValue(new Error("Connection failed"))

      const result = await service.isConnected()

      expect(result).toBe(false)
    })
  })
})
