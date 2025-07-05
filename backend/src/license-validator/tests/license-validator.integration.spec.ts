import { Test, type TestingModule } from "@nestjs/testing"
import type { INestApplication } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import request from "supertest"
import { LicenseValidatorModule } from "../license-validator.module"
import { License, LicenseType } from "../entities/license.entity"
import { LicenseValidation } from "../entities/license-validation.entity"

describe("LicenseValidator Integration Tests", () => {
  let app: INestApplication
  let moduleRef: TestingModule

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env.test",
        }),
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [License, LicenseValidation],
          synchronize: true,
          logging: false,
        }),
        LicenseValidatorModule,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    await moduleRef.close()
  })

  describe("License CRUD Operations", () => {
    it("should create a new license", async () => {
      const createLicenseDto = {
        licenseNumber: "DL123456789",
        licenseType: LicenseType.DRIVER_LICENSE,
        holderId: "driver-001",
        holderName: "John Doe",
        issuingAuthority: "CA",
        issueDate: "2020-01-15",
        expirationDate: "2025-01-15",
      }

      const response = await request(app.getHttpServer())
        .post("/license-validator/licenses")
        .send(createLicenseDto)
        .expect(201)

      expect(response.body.licenseNumber).toBe(createLicenseDto.licenseNumber)
      expect(response.body.licenseType).toBe(createLicenseDto.licenseType)
      expect(response.body.holderName).toBe(createLicenseDto.holderName)
      expect(response.body.isActive).toBe(true)
    })

    it("should not create duplicate license", async () => {
      const createLicenseDto = {
        licenseNumber: "DL123456789", // Same as above
        licenseType: LicenseType.DRIVER_LICENSE,
        holderId: "driver-002",
        holderName: "Jane Doe",
        issuingAuthority: "CA",
        issueDate: "2021-01-15",
        expirationDate: "2026-01-15",
      }

      await request(app.getHttpServer()).post("/license-validator/licenses").send(createLicenseDto).expect(400)
    })

    it("should get license by ID", async () => {
      // First create a license
      const createLicenseDto = {
        licenseNumber: "DL987654321",
        licenseType: LicenseType.DRIVER_LICENSE,
        holderId: "driver-003",
        holderName: "Bob Smith",
        issuingAuthority: "NY",
        issueDate: "2019-06-01",
        expirationDate: "2024-06-01",
      }

      const createResponse = await request(app.getHttpServer())
        .post("/license-validator/licenses")
        .send(createLicenseDto)
        .expect(201)

      const licenseId = createResponse.body.id

      // Get the license by ID
      const getResponse = await request(app.getHttpServer()).get(`/license-validator/licenses/${licenseId}`).expect(200)

      expect(getResponse.body.id).toBe(licenseId)
      expect(getResponse.body.licenseNumber).toBe(createLicenseDto.licenseNumber)
    })

    it("should update license information", async () => {
      // First create a license
      const createLicenseDto = {
        licenseNumber: "CDL555666777",
        licenseType: LicenseType.CDL,
        holderId: "driver-004",
        holderName: "Alice Johnson",
        issuingAuthority: "TX",
        issueDate: "2018-03-15",
        expirationDate: "2023-03-15",
      }

      const createResponse = await request(app.getHttpServer())
        .post("/license-validator/licenses")
        .send(createLicenseDto)
        .expect(201)

      const licenseId = createResponse.body.id

      // Update the license
      const updateData = {
        holderName: "Alice Johnson-Smith",
        expirationDate: "2025-03-15",
      }

      const updateResponse = await request(app.getHttpServer())
        .put(`/license-validator/licenses/${licenseId}`)
        .send(updateData)
        .expect(200)

      expect(updateResponse.body.holderName).toBe("Alice Johnson-Smith")
      expect(new Date(updateResponse.body.expirationDate).getFullYear()).toBe(2025)
    })

    it("should delete license", async () => {
      // First create a license
      const createLicenseDto = {
        licenseNumber: "DL111222333",
        licenseType: LicenseType.DRIVER_LICENSE,
        holderId: "driver-005",
        holderName: "Charlie Brown",
        issuingAuthority: "FL",
        issueDate: "2020-08-01",
        expirationDate: "2025-08-01",
      }

      const createResponse = await request(app.getHttpServer())
        .post("/license-validator/licenses")
        .send(createLicenseDto)
        .expect(201)

      const licenseId = createResponse.body.id

      // Delete the license
      await request(app.getHttpServer()).delete(`/license-validator/licenses/${licenseId}`).expect(204)

      // Verify license is deleted
      await request(app.getHttpServer()).get(`/license-validator/licenses/${licenseId}`).expect(404)
    })
  })

  describe("License Validation", () => {
    it("should validate a license successfully", async () => {
      // First create a license
      const createLicenseDto = {
        licenseNumber: "DL444555666",
        licenseType: LicenseType.DRIVER_LICENSE,
        holderId: "driver-006",
        holderName: "David Wilson",
        issuingAuthority: "CA",
        issueDate: "2021-01-01",
        expirationDate: "2026-01-01",
      }

      await request(app.getHttpServer()).post("/license-validator/licenses").send(createLicenseDto).expect(201)

      // Validate the license
      const validateDto = {
        licenseNumber: "DL444555666",
        licenseType: LicenseType.DRIVER_LICENSE,
        issuingAuthority: "CA",
      }

      const response = await request(app.getHttpServer())
        .post("/license-validator/validate")
        .send(validateDto)
        .expect(200)

      expect(response.body.license.licenseNumber).toBe(validateDto.licenseNumber)
      expect(response.body.validation).toBeDefined()
      expect(response.body.validation.validationStatus).toBeDefined()
      expect(typeof response.body.isValid).toBe("boolean")
    })

    it("should validate expired license", async () => {
      // Create an expired license
      const createLicenseDto = {
        licenseNumber: "EXPIRED001",
        licenseType: LicenseType.DRIVER_LICENSE,
        holderId: "driver-007",
        holderName: "Expired Driver",
        issuingAuthority: "CA",
        issueDate: "2018-01-01",
        expirationDate: "2023-01-01", // Expired
      }

      await request(app.getHttpServer()).post("/license-validator/licenses").send(createLicenseDto).expect(201)

      // Configure mock service to simulate expired license
      await request(app.getHttpServer())
        .post("/license-validator/test/configure-mock-validation")
        .send({
          expiredLicenses: ["EXPIRED001"],
        })
        .expect(200)

      // Validate the expired license
      const validateDto = {
        licenseNumber: "EXPIRED001",
        licenseType: LicenseType.DRIVER_LICENSE,
        issuingAuthority: "CA",
      }

      const response = await request(app.getHttpServer())
        .post("/license-validator/validate")
        .send(validateDto)
        .expect(200)

      expect(response.body.isValid).toBe(false)
      expect(response.body.message).toContain("expired")
    })

    it("should validate invalid license", async () => {
      // Configure mock service to simulate invalid license
      await request(app.getHttpServer())
        .post("/license-validator/test/configure-mock-validation")
        .send({
          invalidLicenses: ["INVALID001"],
        })
        .expect(200)

      // Validate the invalid license
      const validateDto = {
        licenseNumber: "INVALID001",
        licenseType: LicenseType.DRIVER_LICENSE,
        issuingAuthority: "CA",
      }

      const response = await request(app.getHttpServer())
        .post("/license-validator/validate")
        .send(validateDto)
        .expect(200)

      expect(response.body.isValid).toBe(false)
      expect(response.body.message).toContain("not found")
    })

    it("should perform bulk validation", async () => {
      // Create multiple licenses
      const licenses = [
        {
          licenseNumber: "BULK001",
          licenseType: LicenseType.DRIVER_LICENSE,
          holderId: "driver-008",
          holderName: "Bulk Driver 1",
          issuingAuthority: "CA",
          issueDate: "2020-01-01",
          expirationDate: "2025-01-01",
        },
        {
          licenseNumber: "BULK002",
          licenseType: LicenseType.CDL,
          holderId: "driver-009",
          holderName: "Bulk Driver 2",
          issuingAuthority: "TX",
          issueDate: "2019-06-01",
          expirationDate: "2024-06-01",
        },
      ]

      for (const license of licenses) {
        await request(app.getHttpServer()).post("/license-validator/licenses").send(license).expect(201)
      }

      // Perform bulk validation
      const bulkValidateDto = {
        licenses: [
          {
            licenseNumber: "BULK001",
            licenseType: LicenseType.DRIVER_LICENSE,
            issuingAuthority: "CA",
          },
          {
            licenseNumber: "BULK002",
            licenseType: LicenseType.CDL,
            issuingAuthority: "TX",
          },
        ],
      }

      const response = await request(app.getHttpServer())
        .post("/license-validator/validate/bulk")
        .send(bulkValidateDto)
        .expect(200)

      expect(response.body.totalProcessed).toBe(2)
      expect(response.body.results).toHaveLength(2)
      expect(response.body.processingTimeMs).toBeGreaterThan(0)
    })
  })

  describe("License Search and Filtering", () => {
    beforeAll(async () => {
      // Create test licenses for search
      const testLicenses = [
        {
          licenseNumber: "SEARCH001",
          licenseType: LicenseType.DRIVER_LICENSE,
          holderId: "search-driver-001",
          holderName: "Search Driver 1",
          issuingAuthority: "CA",
          issueDate: "2020-01-01",
          expirationDate: "2025-01-01",
        },
        {
          licenseNumber: "SEARCH002",
          licenseType: LicenseType.CDL,
          holderId: "search-driver-002",
          holderName: "Search Driver 2",
          issuingAuthority: "NY",
          issueDate: "2019-06-01",
          expirationDate: "2024-06-01",
        },
        {
          licenseNumber: "SEARCH003",
          licenseType: LicenseType.DRIVER_LICENSE,
          holderId: "search-driver-003",
          holderName: "Search Driver 3",
          issuingAuthority: "CA",
          issueDate: "2021-03-01",
          expirationDate: "2026-03-01",
        },
      ]

      for (const license of testLicenses) {
        await request(app.getHttpServer()).post("/license-validator/licenses").send(license)
      }
    })

    it("should search licenses by license type", async () => {
      const response = await request(app.getHttpServer())
        .get("/license-validator/licenses")
        .query({ licenseType: LicenseType.DRIVER_LICENSE })
        .expect(200)

      expect(response.body.licenses.length).toBeGreaterThan(0)
      response.body.licenses.forEach((license) => {
        expect(license.licenseType).toBe(LicenseType.DRIVER_LICENSE)
      })
    })

    it("should search licenses by issuing authority", async () => {
      const response = await request(app.getHttpServer())
        .get("/license-validator/licenses")
        .query({ issuingAuthority: "CA" })
        .expect(200)

      expect(response.body.licenses.length).toBeGreaterThan(0)
      response.body.licenses.forEach((license) => {
        expect(license.issuingAuthority).toBe("CA")
      })
    })

    it("should paginate license results", async () => {
      const response = await request(app.getHttpServer())
        .get("/license-validator/licenses")
        .query({ limit: 2, offset: 0 })
        .expect(200)

      expect(response.body.licenses.length).toBeLessThanOrEqual(2)
      expect(response.body.limit).toBe(2)
      expect(response.body.offset).toBe(0)
      expect(typeof response.body.hasMore).toBe("boolean")
    })

    it("should sort licenses by creation date", async () => {
      const response = await request(app.getHttpServer())
        .get("/license-validator/licenses")
        .query({ sortBy: "createdAt", sortOrder: "DESC" })
        .expect(200)

      if (response.body.licenses.length > 1) {
        const firstDate = new Date(response.body.licenses[0].createdAt)
        const secondDate = new Date(response.body.licenses[1].createdAt)
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime())
      }
    })
  })

  describe("Statistics and Health Check", () => {
    it("should get license statistics", async () => {
      const response = await request(app.getHttpServer()).get("/license-validator/statistics/licenses").expect(200)

      expect(response.body.totalLicenses).toBeGreaterThan(0)
      expect(typeof response.body.activeLicenses).toBe("number")
      expect(typeof response.body.expiredLicenses).toBe("number")
      expect(typeof response.body.validLicenses).toBe("number")
      expect(response.body.byLicenseType).toBeDefined()
      expect(response.body.byIssuingAuthority).toBeDefined()
    })

    it("should get validation statistics", async () => {
      const response = await request(app.getHttpServer()).get("/license-validator/statistics/validations").expect(200)

      expect(typeof response.body.totalValidations).toBe("number")
      expect(typeof response.body.successfulValidations).toBe("number")
      expect(typeof response.body.failedValidations).toBe("number")
      expect(typeof response.body.averageResponseTime).toBe("number")
    })

    it("should perform health check", async () => {
      const response = await request(app.getHttpServer()).get("/license-validator/health").expect(200)

      expect(response.body.status).toBe("healthy")
      expect(response.body.timestamp).toBeDefined()
      expect(response.body.services.mockValidation).toBeDefined()
      expect(response.body.statistics).toBeDefined()
    })
  })

  describe("Test Utilities", () => {
    it("should create test licenses", async () => {
      const response = await request(app.getHttpServer())
        .post("/license-validator/test/create-test-licenses")
        .expect(201)

      expect(response.body.message).toBe("Test licenses created successfully")
      expect(response.body.count).toBeGreaterThan(0)
      expect(response.body.licenses).toBeDefined()
    })

    it("should configure mock validation service", async () => {
      const config = {
        successRate: 95,
        averageResponseTime: 300,
        enableRandomFailures: false,
      }

      const response = await request(app.getHttpServer())
        .post("/license-validator/test/configure-mock-validation")
        .send(config)
        .expect(200)

      expect(response.body.message).toBe("Mock validation service configured successfully")
      expect(response.body.config.successRate).toBe(95)
    })

    it("should reset mock validation service", async () => {
      const response = await request(app.getHttpServer())
        .post("/license-validator/test/reset-mock-validation")
        .expect(200)

      expect(response.body.message).toBe("Mock validation service reset successfully")
      expect(response.body.config.successRate).toBe(85) // Default value
    })
  })

  describe("Error Handling", () => {
    it("should handle invalid license ID", async () => {
      await request(app.getHttpServer()).get("/license-validator/licenses/invalid-uuid").expect(404)
    })

    it("should handle invalid validation request", async () => {
      const invalidValidateDto = {
        licenseNumber: "", // Empty license number
        licenseType: "INVALID_TYPE",
        issuingAuthority: "",
      }

      await request(app.getHttpServer()).post("/license-validator/validate").send(invalidValidateDto).expect(400)
    })

    it("should handle invalid license creation", async () => {
      const invalidCreateDto = {
        licenseNumber: "", // Empty license number
        licenseType: LicenseType.DRIVER_LICENSE,
        // Missing required fields
      }

      await request(app.getHttpServer()).post("/license-validator/licenses").send(invalidCreateDto).expect(400)
    })
  })
})
