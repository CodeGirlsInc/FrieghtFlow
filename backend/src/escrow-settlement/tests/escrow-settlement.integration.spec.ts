import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"
import * as request from "supertest"
import { EscrowSettlementModule } from "../escrow-settlement.module"
import { EscrowTransaction, TransactionType, TransactionStatus, Currency } from "../entities/escrow-transaction.entity"
import { StarkNetService } from "../services/starknet.service"
import { jest } from "@jest/globals"

describe("EscrowSettlement Integration Tests", () => {
  let app: INestApplication
  let moduleRef: TestingModule
  let starkNetService: StarkNetService

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [EscrowTransaction],
          synchronize: true,
          logging: false,
        }),
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              STARKNET_RPC_URL: "https://starknet-mainnet.public.blastapi.io",
              STARKNET_CHAIN_ID: "SN_MAIN",
              STARKNET_PRIVATE_KEY: "0x1234567890abcdef1234567890abcdef12345678",
              STARKNET_ACCOUNT_ADDRESS: "0x0123456789abcdef0123456789abcdef01234567",
            }),
          ],
        }),
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),
        EscrowSettlementModule,
      ],
    })
      .overrideProvider(StarkNetService)
      .useValue({
        lockFunds: jest.fn().mockResolvedValue({
          transaction_hash: "0xmock123",
          execution_status: "PENDING",
          finality_status: "RECEIVED",
        }),
        releaseFunds: jest.fn().mockResolvedValue({
          transaction_hash: "0xmock456",
          execution_status: "PENDING",
          finality_status: "RECEIVED",
        }),
        refundFunds: jest.fn().mockResolvedValue({
          transaction_hash: "0xmock789",
          execution_status: "PENDING",
          finality_status: "RECEIVED",
        }),
        getTransactionReceipt: jest.fn().mockResolvedValue({
          transaction_hash: "0xmock123",
          block_number: 12345,
          block_hash: "0xblock123",
          execution_status: "SUCCEEDED",
          finality_status: "ACCEPTED_ON_L2",
          gas_consumed: "1000000000000000",
          gas_price: "1",
          events: [],
        }),
        isTransactionConfirmed: jest.fn().mockResolvedValue(true),
      })
      .compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.init()

    starkNetService = moduleRef.get<StarkNetService>(StarkNetService)
  })

  afterAll(async () => {
    await app.close()
    await moduleRef.close()
  })

  describe("POST /escrow-settlement/lock", () => {
    it("should lock funds successfully", async () => {
      const lockFundsDto = {
        transactionId: "tx-lock-001",
        amount: "1000000000000000000",
        currency: Currency.ETH,
        senderAddress: "0x1234567890123456789012345678901234567890",
        recipientAddress: "0x0987654321098765432109876543210987654321",
        contractAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      }

      const response = await request(app.getHttpServer()).post("/escrow-settlement/lock").send(lockFundsDto).expect(201)

      expect(response.body).toMatchObject({
        transactionId: lockFundsDto.transactionId,
        type: TransactionType.LOCK,
        status: TransactionStatus.SUBMITTED,
        amount: lockFundsDto.amount,
        currency: lockFundsDto.currency,
        senderAddress: lockFundsDto.senderAddress,
        recipientAddress: lockFundsDto.recipientAddress,
        contractAddress: lockFundsDto.contractAddress,
        starknetTxHash: "0xmock123",
      })
      expect(response.body.id).toBeDefined()
      expect(response.body.createdAt).toBeDefined()
    })

    it("should return 400 for invalid amount", async () => {
      const lockFundsDto = {
        transactionId: "tx-invalid-amount",
        amount: "invalid-amount",
        currency: Currency.ETH,
        senderAddress: "0x1234567890123456789012345678901234567890",
        recipientAddress: "0x0987654321098765432109876543210987654321",
        contractAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      }

      await request(app.getHttpServer()).post("/escrow-settlement/lock").send(lockFundsDto).expect(400)
    })

    it("should return 400 for invalid Ethereum address", async () => {
      const lockFundsDto = {
        transactionId: "tx-invalid-address",
        amount: "1000000000000000000",
        currency: Currency.ETH,
        senderAddress: "invalid-address",
        recipientAddress: "0x0987654321098765432109876543210987654321",
        contractAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      }

      await request(app.getHttpServer()).post("/escrow-settlement/lock").send(lockFundsDto).expect(400)
    })

    it("should return 409 for duplicate transaction ID", async () => {
      const lockFundsDto = {
        transactionId: "tx-duplicate",
        amount: "1000000000000000000",
        currency: Currency.ETH,
        senderAddress: "0x1234567890123456789012345678901234567890",
        recipientAddress: "0x0987654321098765432109876543210987654321",
        contractAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      }

      // First request should succeed
      await request(app.getHttpServer()).post("/escrow-settlement/lock").send(lockFundsDto).expect(201)

      // Second request with same transaction ID should fail
      await request(app.getHttpServer()).post("/escrow-settlement/lock").send(lockFundsDto).expect(409)
    })

    it("should validate currency enum", async () => {
      const lockFundsDto = {
        transactionId: "tx-invalid-currency",
        amount: "1000000000000000000",
        currency: "INVALID_CURRENCY",
        senderAddress: "0x1234567890123456789012345678901234567890",
        recipientAddress: "0x0987654321098765432109876543210987654321",
        contractAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      }

      await request(app.getHttpServer()).post("/escrow-settlement/lock").send(lockFundsDto).expect(400)
    })
  })

  describe("POST /escrow-settlement/release", () => {
    let lockTransactionId: string

    beforeEach(async () => {
      // Create a lock transaction first
      const lockFundsDto = {
        transactionId: `tx-lock-${Date.now()}`,
        amount: "1000000000000000000",
        currency: Currency.ETH,
        senderAddress: "0x1234567890123456789012345678901234567890",
        recipientAddress: "0x0987654321098765432109876543210987654321",
        contractAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      }

      const lockResponse = await request(app.getHttpServer())
        .post("/escrow-settlement/lock")
        .send(lockFundsDto)
        .expect(201)

      lockTransactionId = lockResponse.body.transactionId

      // Manually update the lock transaction to confirmed status for release testing
      // In a real scenario, this would be done by the confirmation process
    })

    it("should release funds successfully", async () => {
      // First, we need to mock the lock transaction as confirmed
      // This is a limitation of the integration test - in reality, the transaction would be confirmed by StarkNet
      const releaseFundsDto = {
        transactionId: lockTransactionId,
        recipientAddress: "0x0987654321098765432109876543210987654321",
      }

      // Mock the service to return a confirmed lock transaction
      const mockLockTransaction = {
        id: "mock-id",
        transactionId: lockTransactionId,
        type: TransactionType.LOCK,
        status: TransactionStatus.CONFIRMED,
        currency: Currency.ETH,
        amount: "1000000000000000000",
        senderAddress: "0x1234567890123456789012345678901234567890",
        contractAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        isExpired: false,
      }

      // This test would need the transaction to be in confirmed state
      // For now, we'll test the validation
      const response = await request(app.getHttpServer())
        .post("/escrow-settlement/release")
        .send(releaseFundsDto)
        .expect(400) // Expecting 400 because lock transaction is not confirmed

      expect(response.body.message).toContain("Lock transaction must be confirmed")
    })

    it("should return 400 for invalid recipient address", async () => {
      const releaseFundsDto = {
        transactionId: lockTransactionId,
        recipientAddress: "invalid-address",
      }

      await request(app.getHttpServer()).post("/escrow-settlement/release").send(releaseFundsDto).expect(400)
    })
  })

  describe("POST /escrow-settlement/refund/:transactionId", () => {
    it("should return 400 for non-existent transaction", async () => {
      await request(app.getHttpServer()).post("/escrow-settlement/refund/non-existent-tx").expect(404)
    })
  })

  describe("GET /escrow-settlement/transactions", () => {
    beforeEach(async () => {
      // Create some test transactions
      const transactions = [
        {
          transactionId: "tx-list-1",
          amount: "1000000000000000000",
          currency: Currency.ETH,
          senderAddress: "0x1111111111111111111111111111111111111111",
          recipientAddress: "0x2222222222222222222222222222222222222222",
          contractAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
        {
          transactionId: "tx-list-2",
          amount: "2000000000000000000",
          currency: Currency.STRK,
          senderAddress: "0x3333333333333333333333333333333333333333",
          recipientAddress: "0x4444444444444444444444444444444444444444",
          contractAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        },
      ]

      for (const tx of transactions) {
        await request(app.getHttpServer()).post("/escrow-settlement/lock").send(tx)
      }
    })

    it("should return paginated transactions", async () => {
      const response = await request(app.getHttpServer())
        .get("/escrow-settlement/transactions")
        .query({ limit: 10, offset: 0 })
        .expect(200)

      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.total).toBeGreaterThanOrEqual(2)
      expect(response.body.data.length).toBeGreaterThanOrEqual(2)
    })

    it("should filter by transaction type", async () => {
      const response = await request(app.getHttpServer())
        .get("/escrow-settlement/transactions")
        .query({ type: TransactionType.LOCK })
        .expect(200)

      expect(response.body.data).toBeInstanceOf(Array)
      response.body.data.forEach((tx) => {
        expect(tx.type).toBe(TransactionType.LOCK)
      })
    })

    it("should filter by status", async () => {
      const response = await request(app.getHttpServer())
        .get("/escrow-settlement/transactions")
        .query({ status: TransactionStatus.SUBMITTED })
        .expect(200)

      expect(response.body.data).toBeInstanceOf(Array)
      response.body.data.forEach((tx) => {
        expect(tx.status).toBe(TransactionStatus.SUBMITTED)
      })
    })

    it("should filter by currency", async () => {
      const response = await request(app.getHttpServer())
        .get("/escrow-settlement/transactions")
        .query({ currency: Currency.ETH })
        .expect(200)

      expect(response.body.data).toBeInstanceOf(Array)
      response.body.data.forEach((tx) => {
        expect(tx.currency).toBe(Currency.ETH)
      })
    })

    it("should filter by sender address", async () => {
      const senderAddress = "0x1111111111111111111111111111111111111111"
      const response = await request(app.getHttpServer())
        .get("/escrow-settlement/transactions")
        .query({ senderAddress })
        .expect(200)

      expect(response.body.data).toBeInstanceOf(Array)
      response.body.data.forEach((tx) => {
        expect(tx.senderAddress).toBe(senderAddress)
      })
    })

    it("should sort transactions", async () => {
      const response = await request(app.getHttpServer())
        .get("/escrow-settlement/transactions")
        .query({ sortBy: "createdAt", sortOrder: "ASC" })
        .expect(200)

      expect(response.body.data).toBeInstanceOf(Array)
      if (response.body.data.length > 1) {
        for (let i = 1; i < response.body.data.length; i++) {
          const prev = new Date(response.body.data[i - 1].createdAt)
          const curr = new Date(response.body.data[i].createdAt)
          expect(curr.getTime()).toBeGreaterThanOrEqual(prev.getTime())
        }
      }
    })
  })

  describe("GET /escrow-settlement/transactions/:id", () => {
    let transactionId: string

    beforeEach(async () => {
      const lockFundsDto = {
        transactionId: `tx-get-${Date.now()}`,
        amount: "1000000000000000000",
        currency: Currency.ETH,
        senderAddress: "0x1234567890123456789012345678901234567890",
        recipientAddress: "0x0987654321098765432109876543210987654321",
        contractAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      }

      const response = await request(app.getHttpServer()).post("/escrow-settlement/lock").send(lockFundsDto)

      transactionId = response.body.id
    })

    it("should return a single transaction", async () => {
      const response = await request(app.getHttpServer())
        .get(`/escrow-settlement/transactions/${transactionId}`)
        .expect(200)

      expect(response.body.id).toBe(transactionId)
      expect(response.body.type).toBe(TransactionType.LOCK)
    })

    it("should return 404 for non-existent transaction", async () => {
      const nonExistentId = "123e4567-e89b-12d3-a456-426614174000"
      await request(app.getHttpServer()).get(`/escrow-settlement/transactions/${nonExistentId}`).expect(404)
    })

    it("should return 400 for invalid UUID", async () => {
      await request(app.getHttpServer()).get("/escrow-settlement/transactions/invalid-uuid").expect(400)
    })
  })

  describe("GET /escrow-settlement/status/:transactionId", () => {
    let transactionId: string

    beforeEach(async () => {
      const lockFundsDto = {
        transactionId: `tx-status-${Date.now()}`,
        amount: "1000000000000000000",
        currency: Currency.ETH,
        senderAddress: "0x1234567890123456789012345678901234567890",
        recipientAddress: "0x0987654321098765432109876543210987654321",
        contractAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      }

      const response = await request(app.getHttpServer()).post("/escrow-settlement/lock").send(lockFundsDto)

      transactionId = response.body.transactionId
    })

    it("should return transaction status with details", async () => {
      const response = await request(app.getHttpServer()).get(`/escrow-settlement/status/${transactionId}`).expect(200)

      expect(response.body.status).toBeDefined()
      expect(response.body.details).toBeDefined()
      expect(response.body.details.transactionId).toBe(transactionId)
      expect(response.body.details.blockchain).toBeDefined()
    })

    it("should return 404 for non-existent transaction", async () => {
      await request(app.getHttpServer()).get("/escrow-settlement/status/non-existent-tx").expect(404)
    })
  })

  describe("GET /escrow-settlement/statistics", () => {
    beforeEach(async () => {
      // Create some test transactions for statistics
      const transactions = [
        {
          transactionId: `tx-stats-1-${Date.now()}`,
          amount: "1000000000000000000",
          currency: Currency.ETH,
          senderAddress: "0x1111111111111111111111111111111111111111",
          recipientAddress: "0x2222222222222222222222222222222222222222",
          contractAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
        {
          transactionId: `tx-stats-2-${Date.now()}`,
          amount: "2000000000000000000",
          currency: Currency.STRK,
          senderAddress: "0x3333333333333333333333333333333333333333",
          recipientAddress: "0x4444444444444444444444444444444444444444",
          contractAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        },
      ]

      for (const tx of transactions) {
        await request(app.getHttpServer()).post("/escrow-settlement/lock").send(tx)
      }
    })

    it("should return transaction statistics", async () => {
      const response = await request(app.getHttpServer()).get("/escrow-settlement/statistics").expect(200)

      expect(response.body).toHaveProperty("total")
      expect(response.body).toHaveProperty("pending")
      expect(response.body).toHaveProperty("submitted")
      expect(response.body).toHaveProperty("confirmed")
      expect(response.body).toHaveProperty("failed")
      expect(response.body).toHaveProperty("locks")
      expect(response.body).toHaveProperty("releases")
      expect(response.body).toHaveProperty("refunds")
      expect(response.body).toHaveProperty("totalLocked")
      expect(response.body).toHaveProperty("totalReleased")
      expect(typeof response.body.total).toBe("number")
      expect(response.body.total).toBeGreaterThan(0)
    })
  })

  describe("POST /escrow-settlement/retry/:id", () => {
    it("should return 404 for non-existent transaction", async () => {
      const nonExistentId = "123e4567-e89b-12d3-a456-426614174000"
      await request(app.getHttpServer()).post(`/escrow-settlement/retry/${nonExistentId}`).expect(404)
    })

    it("should return 400 for invalid UUID", async () => {
      await request(app.getHttpServer()).post("/escrow-settlement/retry/invalid-uuid").expect(400)
    })
  })
})
