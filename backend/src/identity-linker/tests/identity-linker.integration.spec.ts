import { Test, type TestingModule } from "@nestjs/testing"
import type { INestApplication } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import * as request from "supertest"
import { ethers } from "ethers"
import { IdentityLinkerModule } from "../identity-linker.module"
import { IdentityLink } from "../entities/identity-link.entity"
import { WalletNonce } from "../entities/wallet-nonce.entity"

describe("IdentityLinker Integration Tests", () => {
  let app: INestApplication
  let wallet: ethers.Wallet

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [IdentityLink, WalletNonce],
          synchronize: true,
        }),
        IdentityLinkerModule,
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    // Create a test wallet
    wallet = ethers.Wallet.createRandom()
  })

  afterAll(async () => {
    await app.close()
  })

  describe("Complete wallet linking flow", () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000"
    let nonce: string
    let message: string

    it("should generate nonce for wallet", async () => {
      const response = await request(app.getHttpServer())
        .post("/identity-linker/generate-nonce")
        .send({ walletAddress: wallet.address })
        .expect(200)

      expect(response.body).toHaveProperty("nonce")
      expect(response.body).toHaveProperty("message")
      expect(response.body).toHaveProperty("expiresAt")

      nonce = response.body.nonce
      message = response.body.message
    })

    it("should link wallet with valid signature", async () => {
      const signature = await wallet.signMessage(message)

      const response = await request(app.getHttpServer())
        .post("/identity-linker/link-wallet")
        .send({
          userId,
          walletAddress: wallet.address,
          signature,
        })
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body).toHaveProperty("linkId")
      expect(response.body).toHaveProperty("linkedAt")
    })

    it("should retrieve linked identities", async () => {
      const response = await request(app.getHttpServer())
        .get(`/identity-linker/linked-identities?userId=${userId}`)
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].userId).toBe(userId)
      expect(response.body[0].walletAddress).toBe(wallet.address.toLowerCase())
    })

    it("should check wallet link status", async () => {
      const response = await request(app.getHttpServer())
        .get(`/identity-linker/check-link/${userId}/${wallet.address}`)
        .expect(200)

      expect(response.body.isLinked).toBe(true)
    })

    it("should get user by wallet address", async () => {
      const response = await request(app.getHttpServer())
        .get(`/identity-linker/user-by-wallet/${wallet.address}`)
        .expect(200)

      expect(response.body.userId).toBe(userId)
    })

    it("should unlink wallet", async () => {
      await request(app.getHttpServer())
        .delete(`/identity-linker/unlink-wallet/${userId}/${wallet.address}`)
        .expect(204)
    })

    it("should confirm wallet is unlinked", async () => {
      const response = await request(app.getHttpServer())
        .get(`/identity-linker/check-link/${userId}/${wallet.address}`)
        .expect(200)

      expect(response.body.isLinked).toBe(false)
    })
  })

  describe("Error scenarios", () => {
    it("should reject invalid wallet address", async () => {
      await request(app.getHttpServer())
        .post("/identity-linker/generate-nonce")
        .send({ walletAddress: "invalid-address" })
        .expect(400)
    })

    it("should reject linking without valid nonce", async () => {
      const signature = await wallet.signMessage("invalid message")

      await request(app.getHttpServer())
        .post("/identity-linker/link-wallet")
        .send({
          userId: "123e4567-e89b-12d3-a456-426614174000",
          walletAddress: wallet.address,
          signature,
        })
        .expect(400)
    })
  })
})
