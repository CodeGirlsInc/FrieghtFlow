import { Test, type TestingModule } from "@nestjs/testing"
import { ConfigService } from "@nestjs/config"
import { StarkNetService } from "../services/starknet.service"
import {
  StarkNetConnectionException,
  ContractExecutionException,
  InsufficientFundsException,
} from "../exceptions/escrow-settlement.exceptions"
import { jest } from "@jest/globals"

// Mock starknet module
jest.mock("starknet", () => ({
  Account: jest.fn().mockImplementation(() => ({
    address: "0x123",
  })),
  Contract: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    lock_funds: jest.fn(),
    release_funds: jest.fn(),
    refund_funds: jest.fn(),
    balanceOf: jest.fn(),
    decimals: jest.fn(),
    symbol: jest.fn(),
  })),
  RpcProvider: jest.fn().mockImplementation(() => ({
    getTransactionReceipt: jest.fn(),
    getBalance: jest.fn(),
  })),
  CallData: {
    compile: jest.fn(),
  },
  cairo: {
    felt: jest.fn(),
    uint256: jest.fn(),
  },
}))

describe("StarkNetService", () => {
  let service: StarkNetService
  let configService: ConfigService

  const mockConfigService = {
    get: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StarkNetService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    // Setup config mock
    mockConfigService.get.mockImplementation((key: string, defaultValue?: string) => {
      const config = {
        STARKNET_RPC_URL: "https://starknet-mainnet.public.blastapi.io",
        STARKNET_CHAIN_ID: "SN_MAIN",
        STARKNET_PRIVATE_KEY: "0x1234567890abcdef",
        STARKNET_ACCOUNT_ADDRESS: "0x0123456789abcdef0123456789abcdef01234567",
      }
      return config[key] || defaultValue
    })

    service = module.get<StarkNetService>(StarkNetService)
    configService = module.get<ConfigService>(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("initialization", () => {
    it("should initialize successfully with valid config", () => {
      expect(service).toBeDefined()
    })

    it("should throw StarkNetConnectionException with invalid config", async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === "STARKNET_PRIVATE_KEY") return undefined
        return "valid-value"
      })

      expect(() => {
        new StarkNetService(configService)
      }).toThrow(StarkNetConnectionException)
    })
  })

  describe("lockFunds", () => {
    it("should lock funds successfully", async () => {
      const mockContract = {
        connect: jest.fn(),
        lock_funds: jest.fn().mockResolvedValue({
          transaction_hash: "0xabc123",
        }),
      }

      const { Contract, CallData, cairo } = await import("starknet")
      ;(Contract as jest.Mock).mockImplementation(() => mockContract)
      ;(CallData.compile as jest.Mock).mockReturnValue({})
      ;(cairo.felt as jest.Mock).mockReturnValue("felt_value")
      ;(cairo.uint256 as jest.Mock).mockReturnValue("uint256_value")

      // Mock balance check
      jest.spyOn(service, "getBalance").mockResolvedValue({
        balance: "1000000000000000000", // 1 ETH
        decimals: 18,
        symbol: "ETH",
      })

      const result = await service.lockFunds(
        "0xcontract123",
        "tx-123",
        "500000000000000000", // 0.5 ETH
        "0xsender123",
        "0xrecipient123",
      )

      expect(result.transaction_hash).toBe("0xabc123")
      expect(mockContract.lock_funds).toHaveBeenCalled()
    })

    it("should throw InsufficientFundsException when balance is low", async () => {
      jest.spyOn(service, "getBalance").mockResolvedValue({
        balance: "100000000000000000", // 0.1 ETH
        decimals: 18,
        symbol: "ETH",
      })

      await expect(
        service.lockFunds(
          "0xcontract123",
          "tx-123",
          "500000000000000000", // 0.5 ETH
          "0xsender123",
          "0xrecipient123",
        ),
      ).rejects.toThrow(InsufficientFundsException)
    })

    it("should throw ContractExecutionException on contract error", async () => {
      const mockContract = {
        connect: jest.fn(),
        lock_funds: jest.fn().mockRejectedValue(new Error("Contract error")),
      }

      const { Contract } = await import("starknet")
      ;(Contract as jest.Mock).mockImplementation(() => mockContract)

      jest.spyOn(service, "getBalance").mockResolvedValue({
        balance: "1000000000000000000",
        decimals: 18,
        symbol: "ETH",
      })

      await expect(
        service.lockFunds("0xcontract123", "tx-123", "500000000000000000", "0xsender123", "0xrecipient123"),
      ).rejects.toThrow(ContractExecutionException)
    })
  })

  describe("releaseFunds", () => {
    it("should release funds successfully", async () => {
      const mockContract = {
        connect: jest.fn(),
        release_funds: jest.fn().mockResolvedValue({
          transaction_hash: "0xdef456",
        }),
      }

      const { Contract, CallData, cairo } = await import("starknet")
      ;(Contract as jest.Mock).mockImplementation(() => mockContract)
      ;(CallData.compile as jest.Mock).mockReturnValue({})
      ;(cairo.felt as jest.Mock).mockReturnValue("felt_value")

      const result = await service.releaseFunds("0xcontract123", "tx-123", "0xrecipient123")

      expect(result.transaction_hash).toBe("0xdef456")
      expect(mockContract.release_funds).toHaveBeenCalled()
    })

    it("should throw ContractExecutionException on contract error", async () => {
      const mockContract = {
        connect: jest.fn(),
        release_funds: jest.fn().mockRejectedValue(new Error("Release error")),
      }

      const { Contract } = await import("starknet")
      ;(Contract as jest.Mock).mockImplementation(() => mockContract)

      await expect(service.releaseFunds("0xcontract123", "tx-123", "0xrecipient123")).rejects.toThrow(
        ContractExecutionException,
      )
    })
  })

  describe("refundFunds", () => {
    it("should refund funds successfully", async () => {
      const mockContract = {
        connect: jest.fn(),
        refund_funds: jest.fn().mockResolvedValue({
          transaction_hash: "0xghi789",
        }),
      }

      const { Contract, CallData, cairo } = await import("starknet")
      ;(Contract as jest.Mock).mockImplementation(() => mockContract)
      ;(CallData.compile as jest.Mock).mockReturnValue({})
      ;(cairo.felt as jest.Mock).mockReturnValue("felt_value")

      const result = await service.refundFunds("0xcontract123", "tx-123", "0xsender123")

      expect(result.transaction_hash).toBe("0xghi789")
      expect(mockContract.refund_funds).toHaveBeenCalled()
    })
  })

  describe("getTransactionReceipt", () => {
    it("should get transaction receipt successfully", async () => {
      const mockReceipt = {
        transaction_hash: "0xabc123",
        block_number: 12345,
        block_hash: "0xblock123",
        execution_status: "SUCCEEDED",
        finality_status: "ACCEPTED_ON_L2",
        actual_fee: "1000000000000000",
        events: [],
      }

      const { RpcProvider } = await import("starknet")
      const mockProvider = {
        getTransactionReceipt: jest.fn().mockResolvedValue(mockReceipt),
      }
      ;(RpcProvider as jest.Mock).mockImplementation(() => mockProvider)

      // Create new service instance to use mocked provider
      const newService = new StarkNetService(configService)

      const result = await newService.getTransactionReceipt("0xabc123")

      expect(result.transaction_hash).toBe("0xabc123")
      expect(result.execution_status).toBe("SUCCEEDED")
      expect(result.finality_status).toBe("ACCEPTED_ON_L2")
    })

    it("should throw StarkNetConnectionException on provider error", async () => {
      const { RpcProvider } = await import("starknet")
      const mockProvider = {
        getTransactionReceipt: jest.fn().mockRejectedValue(new Error("Provider error")),
      }
      ;(RpcProvider as jest.Mock).mockImplementation(() => mockProvider)

      const newService = new StarkNetService(configService)

      await expect(newService.getTransactionReceipt("0xabc123")).rejects.toThrow(StarkNetConnectionException)
    })
  })

  describe("getBalance", () => {
    it("should get ETH balance successfully", async () => {
      const { RpcProvider } = await import("starknet")
      const mockProvider = {
        getBalance: jest.fn().mockResolvedValue("1000000000000000000"),
      }
      ;(RpcProvider as jest.Mock).mockImplementation(() => mockProvider)

      const newService = new StarkNetService(configService)

      const result = await newService.getBalance("0xaddress123")

      expect(result.balance).toBe("1000000000000000000")
      expect(result.decimals).toBe(18)
      expect(result.symbol).toBe("ETH")
    })

    it("should get ERC20 token balance successfully", async () => {
      const mockContract = {
        balanceOf: jest.fn().mockResolvedValue({ balance: "500000000" }),
        decimals: jest.fn().mockResolvedValue(6),
        symbol: jest.fn().mockResolvedValue("USDC"),
      }

      const { Contract } = await import("starknet")
      ;(Contract as jest.Mock).mockImplementation(() => mockContract)

      const result = await service.getBalance("0xaddress123", "0xtoken123")

      expect(result.balance).toBe("500000000")
      expect(result.decimals).toBe(6)
      expect(result.symbol).toBe("USDC")
    })
  })

  describe("isTransactionConfirmed", () => {
    it("should return true for confirmed transaction", async () => {
      jest.spyOn(service, "getTransactionReceipt").mockResolvedValue({
        transaction_hash: "0xabc123",
        block_number: 12345,
        block_hash: "0xblock123",
        execution_status: "SUCCEEDED",
        finality_status: "ACCEPTED_ON_L2",
        gas_consumed: "1000000000000000",
        gas_price: "1",
        events: [],
      })

      const result = await service.isTransactionConfirmed("0xabc123")

      expect(result).toBe(true)
    })

    it("should return false for failed transaction", async () => {
      jest.spyOn(service, "getTransactionReceipt").mockResolvedValue({
        transaction_hash: "0xabc123",
        block_number: 12345,
        block_hash: "0xblock123",
        execution_status: "REVERTED",
        finality_status: "ACCEPTED_ON_L2",
        gas_consumed: "1000000000000000",
        gas_price: "1",
        events: [],
      })

      const result = await service.isTransactionConfirmed("0xabc123")

      expect(result).toBe(false)
    })

    it("should return false on error", async () => {
      jest.spyOn(service, "getTransactionReceipt").mockRejectedValue(new Error("Receipt error"))

      const result = await service.isTransactionConfirmed("0xabc123")

      expect(result).toBe(false)
    })
  })
})
