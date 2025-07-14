import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EventEmitterModule } from "@nestjs/event-emitter"
import * as request from "supertest"
import { DeliveryProofModule } from "../delivery-proof.module"
import { DeliveryProof, ProofType, ProofStatus } from "../entities/delivery-proof.entity"

describe("DeliveryProof Integration Tests", () => {
  let app: INestApplication
  let moduleRef: TestingModule

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [DeliveryProof],
          synchronize: true,
          logging: false,
        }),
        EventEmitterModule.forRoot(),
        DeliveryProofModule,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    await moduleRef.close()
  })

  describe("POST /delivery-proofs", () => {
    it("should create a signature proof successfully", async () => {
      const createDto = {
        deliveryId: "delivery-123",
        proofType: ProofType.SIGNATURE,
        signature: "test-signature-data",
        recipientName: "John Doe",
        recipientEmail: "john@example.com",
        latitude: 40.7128,
        longitude: -74.006,
      }

      const response = await request(app.getHttpServer()).post("/delivery-proofs").send(createDto).expect(201)

      expect(response.body).toMatchObject({
        deliveryId: createDto.deliveryId,
        proofType: createDto.proofType,
        signature: createDto.signature,
        status: ProofStatus.PENDING,
        recipientName: createDto.recipientName,
        recipientEmail: createDto.recipientEmail,
      })
      expect(response.body.id).toBeDefined()
      expect(response.body.createdAt).toBeDefined()
    })

    it("should create a photo proof successfully", async () => {
      const createDto = {
        deliveryId: "delivery-456",
        proofType: ProofType.PHOTO,
        photoUrl: "https://example.com/photo.jpg",
        recipientName: "Jane Smith",
      }

      const response = await request(app.getHttpServer()).post("/delivery-proofs").send(createDto).expect(201)

      expect(response.body).toMatchObject({
        deliveryId: createDto.deliveryId,
        proofType: createDto.proofType,
        photoUrl: createDto.photoUrl,
        status: ProofStatus.PENDING,
      })
    })

    it("should create a token proof successfully", async () => {
      const createDto = {
        deliveryId: "delivery-789",
        proofType: ProofType.TOKEN,
        token: "abc123token",
        metadata: { source: "mobile-app", version: "1.0" },
      }

      const response = await request(app.getHttpServer()).post("/delivery-proofs").send(createDto).expect(201)

      expect(response.body).toMatchObject({
        deliveryId: createDto.deliveryId,
        proofType: createDto.proofType,
        token: createDto.token,
        metadata: createDto.metadata,
        status: ProofStatus.PENDING,
      })
    })

    it("should create a QR code proof successfully", async () => {
      const createDto = {
        deliveryId: "delivery-qr-001",
        proofType: ProofType.QR_CODE,
        qrData: "QR_CODE_DATA_12345",
        deviceInfo: { platform: "iOS", version: "15.0" },
      }

      const response = await request(app.getHttpServer()).post("/delivery-proofs").send(createDto).expect(201)

      expect(response.body).toMatchObject({
        deliveryId: createDto.deliveryId,
        proofType: createDto.proofType,
        qrData: createDto.qrData,
        deviceInfo: createDto.deviceInfo,
        status: ProofStatus.PENDING,
      })
    })

    it("should return 400 for invalid proof type", async () => {
      const createDto = {
        deliveryId: "delivery-invalid",
        proofType: "invalid-type",
        signature: "test-signature",
      }

      await request(app.getHttpServer()).post("/delivery-proofs").send(createDto).expect(400)
    })

    it("should return 400 for signature proof without signature", async () => {
      const createDto = {
        deliveryId: "delivery-no-sig",
        proofType: ProofType.SIGNATURE,
      }

      await request(app.getHttpServer()).post("/delivery-proofs").send(createDto).expect(400)
    })

    it("should return 400 for photo proof without photoUrl", async () => {
      const createDto = {
        deliveryId: "delivery-no-photo",
        proofType: ProofType.PHOTO,
      }

      await request(app.getHttpServer()).post("/delivery-proofs").send(createDto).expect(400)
    })

    it("should return 400 for token proof without token", async () => {
      const createDto = {
        deliveryId: "delivery-no-token",
        proofType: ProofType.TOKEN,
      }

      await request(app.getHttpServer()).post("/delivery-proofs").send(createDto).expect(400)
    })

    it("should return 400 for QR proof without qrData", async () => {
      const createDto = {
        deliveryId: "delivery-no-qr",
        proofType: ProofType.QR_CODE,
      }

      await request(app.getHttpServer()).post("/delivery-proofs").send(createDto).expect(400)
    })

    it("should return 409 for duplicate verified proof", async () => {
      // First, create and verify a proof
      const createDto = {
        deliveryId: "delivery-duplicate",
        proofType: ProofType.SIGNATURE,
        signature: "test-signature",
      }

      const createResponse = await request(app.getHttpServer()).post("/delivery-proofs").send(createDto).expect(201)

      // Verify the proof
      await request(app.getHttpServer()).post(`/delivery-proofs/${createResponse.body.id}/verify`).expect(200)

      // Try to create another proof with same deliveryId and proofType
      await request(app.getHttpServer()).post("/delivery-proofs").send(createDto).expect(409)
    })

    it("should validate email format", async () => {
      const createDto = {
        deliveryId: "delivery-invalid-email",
        proofType: ProofType.SIGNATURE,
        signature: "test-signature",
        recipientEmail: "invalid-email",
      }

      await request(app.getHttpServer()).post("/delivery-proofs").send(createDto).expect(400)
    })

    it("should validate latitude range", async () => {
      const createDto = {
        deliveryId: "delivery-invalid-lat",
        proofType: ProofType.SIGNATURE,
        signature: "test-signature",
        latitude: 91, // Invalid latitude
      }

      await request(app.getHttpServer()).post("/delivery-proofs").send(createDto).expect(400)
    })

    it("should validate longitude range", async () => {
      const createDto = {
        deliveryId: "delivery-invalid-lng",
        proofType: ProofType.SIGNATURE,
        signature: "test-signature",
        longitude: 181, // Invalid longitude
      }

      await request(app.getHttpServer()).post("/delivery-proofs").send(createDto).expect(400)
    })
  })

  describe("GET /delivery-proofs", () => {
    beforeEach(async () => {
      // Create some test data
      const proofs = [
        {
          deliveryId: "delivery-list-1",
          proofType: ProofType.SIGNATURE,
          signature: "sig1",
          status: ProofStatus.PENDING,
        },
        {
          deliveryId: "delivery-list-2",
          proofType: ProofType.PHOTO,
          photoUrl: "https://example.com/photo1.jpg",
          status: ProofStatus.VERIFIED,
        },
        {
          deliveryId: "delivery-list-3",
          proofType: ProofType.TOKEN,
          token: "token1",
          status: ProofStatus.FAILED,
        },
      ]

      for (const proof of proofs) {
        await request(app.getHttpServer()).post("/delivery-proofs").send(proof)
      }
    })

    it("should return paginated results", async () => {
      const response = await request(app.getHttpServer())
        .get("/delivery-proofs")
        .query({ limit: 2, offset: 0 })
        .expect(200)

      expect(response.body.data).toHaveLength(2)
      expect(response.body.total).toBeGreaterThanOrEqual(2)
    })

    it("should filter by delivery ID", async () => {
      const response = await request(app.getHttpServer())
        .get("/delivery-proofs")
        .query({ deliveryId: "delivery-list-1" })
        .expect(200)

      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].deliveryId).toBe("delivery-list-1")
    })

    it("should filter by proof type", async () => {
      const response = await request(app.getHttpServer())
        .get("/delivery-proofs")
        .query({ proofType: ProofType.PHOTO })
        .expect(200)

      expect(response.body.data.length).toBeGreaterThanOrEqual(1)
      response.body.data.forEach((proof) => {
        expect(proof.proofType).toBe(ProofType.PHOTO)
      })
    })

    it("should filter by status", async () => {
      const response = await request(app.getHttpServer())
        .get("/delivery-proofs")
        .query({ status: ProofStatus.VERIFIED })
        .expect(200)

      response.body.data.forEach((proof) => {
        expect(proof.status).toBe(ProofStatus.VERIFIED)
      })
    })

    it("should sort results", async () => {
      const response = await request(app.getHttpServer())
        .get("/delivery-proofs")
        .query({ sortBy: "createdAt", sortOrder: "ASC" })
        .expect(200)

      expect(response.body.data.length).toBeGreaterThan(0)
      // Verify ascending order
      for (let i = 1; i < response.body.data.length; i++) {
        const prev = new Date(response.body.data[i - 1].createdAt)
        const curr = new Date(response.body.data[i].createdAt)
        expect(curr.getTime()).toBeGreaterThanOrEqual(prev.getTime())
      }
    })
  })

  describe("GET /delivery-proofs/:id", () => {
    let proofId: string

    beforeEach(async () => {
      const createDto = {
        deliveryId: "delivery-get-one",
        proofType: ProofType.SIGNATURE,
        signature: "test-signature",
      }

      const response = await request(app.getHttpServer()).post("/delivery-proofs").send(createDto)

      proofId = response.body.id
    })

    it("should return a single proof", async () => {
      const response = await request(app.getHttpServer()).get(`/delivery-proofs/${proofId}`).expect(200)

      expect(response.body.id).toBe(proofId)
      expect(response.body.deliveryId).toBe("delivery-get-one")
    })

    it("should return 404 for non-existent proof", async () => {
      const nonExistentId = "123e4567-e89b-12d3-a456-426614174000"
      await request(app.getHttpServer()).get(`/delivery-proofs/${nonExistentId}`).expect(404)
    })

    it("should return 400 for invalid UUID", async () => {
      await request(app.getHttpServer()).get("/delivery-proofs/invalid-uuid").expect(400)
    })
  })

  describe("GET /delivery-proofs/delivery/:deliveryId", () => {
    beforeEach(async () => {
      const proofs = [
        {
          deliveryId: "delivery-multi-1",
          proofType: ProofType.SIGNATURE,
          signature: "sig1",
        },
        {
          deliveryId: "delivery-multi-1",
          proofType: ProofType.PHOTO,
          photoUrl: "https://example.com/photo.jpg",
        },
        {
          deliveryId: "delivery-multi-2",
          proofType: ProofType.TOKEN,
          token: "token1",
        },
      ]

      for (const proof of proofs) {
        await request(app.getHttpServer()).post("/delivery-proofs").send(proof)
      }
    })

    it("should return all proofs for a delivery", async () => {
      const response = await request(app.getHttpServer()).get("/delivery-proofs/delivery/delivery-multi-1").expect(200)

      expect(response.body).toHaveLength(2)
      response.body.forEach((proof) => {
        expect(proof.deliveryId).toBe("delivery-multi-1")
      })
    })

    it("should return empty array for non-existent delivery", async () => {
      const response = await request(app.getHttpServer()).get("/delivery-proofs/delivery/non-existent").expect(200)

      expect(response.body).toHaveLength(0)
    })
  })

  describe("POST /delivery-proofs/:id/verify", () => {
    let proofId: string

    beforeEach(async () => {
      const createDto = {
        deliveryId: "delivery-verify",
        proofType: ProofType.SIGNATURE,
        signature: "test-signature",
      }

      const response = await request(app.getHttpServer()).post("/delivery-proofs").send(createDto)

      proofId = response.body.id
    })

    it("should verify a pending proof", async () => {
      const response = await request(app.getHttpServer()).post(`/delivery-proofs/${proofId}/verify`).expect(200)

      expect(response.body.status).toBe(ProofStatus.VERIFIED)
      expect(response.body.verificationAttempts).toBe(1)
    })

    it("should return 400 when trying to verify non-pending proof", async () => {
      // First verify the proof
      await request(app.getHttpServer()).post(`/delivery-proofs/${proofId}/verify`).expect(200)

      // Try to verify again
      await request(app.getHttpServer()).post(`/delivery-proofs/${proofId}/verify`).expect(400)
    })
  })

  describe("POST /delivery-proofs/:id/fail", () => {
    let proofId: string

    beforeEach(async () => {
      const createDto = {
        deliveryId: "delivery-fail",
        proofType: ProofType.SIGNATURE,
        signature: "test-signature",
      }

      const response = await request(app.getHttpServer()).post("/delivery-proofs").send(createDto)

      proofId = response.body.id
    })

    it("should mark proof as failed", async () => {
      const errorMessage = "Verification failed due to invalid signature"

      const response = await request(app.getHttpServer())
        .post(`/delivery-proofs/${proofId}/fail`)
        .send({ error: errorMessage })
        .expect(200)

      expect(response.body.status).toBe(ProofStatus.FAILED)
      expect(response.body.lastError).toBe(errorMessage)
      expect(response.body.verificationAttempts).toBe(1)
    })
  })

  describe("PATCH /delivery-proofs/:id/blockchain", () => {
    let proofId: string

    beforeEach(async () => {
      const createDto = {
        deliveryId: "delivery-blockchain",
        proofType: ProofType.SIGNATURE,
        signature: "test-signature",
      }

      const response = await request(app.getHttpServer()).post("/delivery-proofs").send(createDto)

      proofId = response.body.id

      // Verify the proof first
      await request(app.getHttpServer()).post(`/delivery-proofs/${proofId}/verify`)
    })

    it("should update blockchain information", async () => {
      const txHash = "0x1234567890abcdef"
      const blockNumber = "12345"

      const response = await request(app.getHttpServer())
        .patch(`/delivery-proofs/${proofId}/blockchain`)
        .send({ txHash, blockNumber })
        .expect(200)

      expect(response.body.blockchainTxHash).toBe(txHash)
      expect(response.body.blockchainBlockNumber).toBe(blockNumber)
      expect(response.body.status).toBe(ProofStatus.BLOCKCHAIN_CONFIRMED)
    })
  })

  describe("GET /delivery-proofs/statistics", () => {
    beforeEach(async () => {
      const proofs = [
        {
          deliveryId: "delivery-stats-1",
          proofType: ProofType.SIGNATURE,
          signature: "sig1",
        },
        {
          deliveryId: "delivery-stats-2",
          proofType: ProofType.PHOTO,
          photoUrl: "https://example.com/photo.jpg",
        },
      ]

      for (const proof of proofs) {
        const response = await request(app.getHttpServer()).post("/delivery-proofs").send(proof)

        // Verify one of them
        if (proof.deliveryId === "delivery-stats-1") {
          await request(app.getHttpServer()).post(`/delivery-proofs/${response.body.id}/verify`)
        }
      }
    })

    it("should return statistics", async () => {
      const response = await request(app.getHttpServer()).get("/delivery-proofs/statistics").expect(200)

      expect(response.body).toHaveProperty("total")
      expect(response.body).toHaveProperty("pending")
      expect(response.body).toHaveProperty("verified")
      expect(response.body).toHaveProperty("failed")
      expect(response.body).toHaveProperty("blockchainConfirmed")
      expect(typeof response.body.total).toBe("number")
      expect(response.body.total).toBeGreaterThan(0)
    })
  })

  describe("DELETE /delivery-proofs/:id", () => {
    let proofId: string

    beforeEach(async () => {
      const createDto = {
        deliveryId: "delivery-delete",
        proofType: ProofType.SIGNATURE,
        signature: "test-signature",
      }

      const response = await request(app.getHttpServer()).post("/delivery-proofs").send(createDto)

      proofId = response.body.id
    })

    it("should delete a proof", async () => {
      await request(app.getHttpServer()).delete(`/delivery-proofs/${proofId}`).expect(204)

      // Verify it's deleted
      await request(app.getHttpServer()).get(`/delivery-proofs/${proofId}`).expect(404)
    })
  })
})
