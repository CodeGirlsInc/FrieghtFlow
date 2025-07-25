import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ConfigService } from "@nestjs/config"
import { getQueueToken } from "@nestjs/bull"
import type { Repository } from "typeorm"
import { EmailService } from "../src/email/services/email.service"
import { TemplateService } from "../src/email/services/template.service"
import { EmailProviderFactory } from "../src/email/factories/email-provider.factory"
import { EmailMessageEntity } from "../src/email/entities/email-message.entity"
import { EmailUnsubscribeEntity } from "../src/email/entities/email-unsubscribe.entity"
import { LoggerService } from "../src/logger/services/logger.service"
import { EmailCategory, EmailPriority, DeliveryStatus } from "../src/email/interfaces/email.interface"
import { jest } from "@jest/globals"

describe("EmailService", () => {
  let service: EmailService
  let messageRepository: Repository<EmailMessageEntity>
  let unsubscribeRepository: Repository<EmailUnsubscribeEntity>
  let templateService: TemplateService
  let emailQueue: any

  const mockMessageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findByIds: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
  }

  const mockUnsubscribeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  }

  const mockTemplateService = {
    renderTemplate: jest.fn(),
    getTemplate: jest.fn(),
  }

  const mockEmailQueue = {
    add: jest.fn(),
    removeJobs: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn().mockReturnValue({
      provider: "sendgrid",
      fromEmail: "test@freightflow.com",
      fromName: "FreightFlow Test",
      maxRetries: 3,
      retryDelay: 300000,
      batchSize: 100,
      rateLimitPerSecond: 10,
    }),
  }

  const mockEmailProviderFactory = {
    createProvider: jest.fn().mockReturnValue({
      sendSingle: jest.fn().mockResolvedValue("provider-message-id"),
      sendBulk: jest.fn().mockResolvedValue(["id1", "id2"]),
    }),
  }

  const mockLoggerService = {
    info: jest.fn(),
    error: jest.fn(),
    audit: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getRepositoryToken(EmailMessageEntity),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(EmailUnsubscribeEntity),
          useValue: mockUnsubscribeRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: TemplateService,
          useValue: mockTemplateService,
        },
        {
          provide: EmailProviderFactory,
          useValue: mockEmailProviderFactory,
        },
        {
          provide: getQueueToken("email"),
          useValue: mockEmailQueue,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile()

    service = module.get<EmailService>(EmailService)
    messageRepository = module.get<Repository<EmailMessageEntity>>(getRepositoryToken(EmailMessageEntity))
    unsubscribeRepository = module.get<Repository<EmailUnsubscribeEntity>>(getRepositoryToken(EmailUnsubscribeEntity))
    templateService = module.get<TemplateService>(TemplateService)
    emailQueue = module.get(getQueueToken("email"))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("sendEmail", () => {
    it("should send email successfully", async () => {
      const emailMessage = {
        to: "test@example.com",
        subject: "Test Email",
        htmlContent: "<p>Test content</p>",
        textContent: "Test content",
        category: EmailCategory.WELCOME,
        priority: EmailPriority.NORMAL,
      }

      const savedMessage = {
        id: "message-id",
        ...emailMessage,
        to: ["test@example.com"],
        status: DeliveryStatus.PENDING,
        attempts: 0,
      }

      mockMessageRepository.create.mockReturnValue(savedMessage)
      mockMessageRepository.save.mockResolvedValue(savedMessage)
      mockUnsubscribeRepository.findOne.mockResolvedValue(null)

      const result = await service.sendEmail(emailMessage)

      expect(result).toBe("message-id")
      expect(mockMessageRepository.create).toHaveBeenCalled()
      expect(mockMessageRepository.save).toHaveBeenCalled()
      expect(mockEmailQueue.add).toHaveBeenCalledWith("send-email", { messageId: "message-id" }, expect.any(Object))
    })

    it("should send urgent email immediately", async () => {
      const emailMessage = {
        to: "test@example.com",
        subject: "Urgent Email",
        htmlContent: "<p>Urgent content</p>",
        category: EmailCategory.SECURITY_ALERT,
        priority: EmailPriority.URGENT,
      }

      const savedMessage = {
        id: "urgent-message-id",
        ...emailMessage,
        to: ["test@example.com"],
        status: DeliveryStatus.PENDING,
        attempts: 0,
      }

      mockMessageRepository.create.mockReturnValue(savedMessage)
      mockMessageRepository.save.mockResolvedValue(savedMessage)
      mockUnsubscribeRepository.findOne.mockResolvedValue(null)

      const result = await service.sendEmail(emailMessage)

      expect(result).toBe("urgent-message-id")
      expect(mockMessageRepository.save).toHaveBeenCalledTimes(2) // Once for initial save, once for update after send
    })

    it("should throw error for unsubscribed email", async () => {
      const emailMessage = {
        to: "unsubscribed@example.com",
        subject: "Test Email",
        htmlContent: "<p>Test content</p>",
        category: EmailCategory.NEWSLETTER,
        priority: EmailPriority.NORMAL,
      }

      mockUnsubscribeRepository.findOne.mockResolvedValue({ email: "unsubscribed@example.com" })

      await expect(service.sendEmail(emailMessage)).rejects.toThrow("has unsubscribed")
    })

    it("should validate email addresses", async () => {
      const emailMessage = {
        to: "invalid-email",
        subject: "Test Email",
        htmlContent: "<p>Test content</p>",
        category: EmailCategory.WELCOME,
        priority: EmailPriority.NORMAL,
      }

      await expect(service.sendEmail(emailMessage)).rejects.toThrow("Invalid email address")
    })
  })

  describe("sendTemplateEmail", () => {
    it("should send template email successfully", async () => {
      const templateData = {
        subject: "Welcome {{name}}!",
        htmlContent: "<p>Welcome {{name}}!</p>",
        textContent: "Welcome {{name}}!",
        category: EmailCategory.WELCOME,
        priority: EmailPriority.HIGH,
      }

      const renderedTemplate = {
        subject: "Welcome John!",
        htmlContent: "<p>Welcome John!</p>",
        textContent: "Welcome John!",
      }

      mockTemplateService.getTemplate.mockResolvedValue(templateData)
      mockTemplateService.renderTemplate.mockResolvedValue(renderedTemplate)
      mockMessageRepository.create.mockReturnValue({
        id: "template-message-id",
        to: ["test@example.com"],
        status: DeliveryStatus.PENDING,
        attempts: 0,
      })
      mockMessageRepository.save.mockResolvedValue({
        id: "template-message-id",
      })
      mockUnsubscribeRepository.findOne.mockResolvedValue(null)

      const result = await service.sendTemplateEmail("template-id", "test@example.com", { name: "John" })

      expect(result).toBe("template-message-id")
      expect(mockTemplateService.renderTemplate).toHaveBeenCalledWith("template-id", { name: "John" })
    })
  })

  describe("sendBulkEmails", () => {
    it("should send bulk emails in batches", async () => {
      const messages = Array.from({ length: 250 }, (_, i) => ({
        to: `test${i}@example.com`,
        subject: `Test Email ${i}`,
        htmlContent: `<p>Test content ${i}</p>`,
        category: EmailCategory.NEWSLETTER,
        priority: EmailPriority.NORMAL,
      }))

      mockMessageRepository.create.mockImplementation((msg) => ({
        id: `message-${Math.random()}`,
        ...msg,
        to: Array.isArray(msg.to) ? msg.to : [msg.to],
        status: DeliveryStatus.PENDING,
        attempts: 0,
      }))
      mockMessageRepository.save.mockImplementation((msg) => Promise.resolve(msg))
      mockUnsubscribeRepository.findOne.mockResolvedValue(null)

      const results = await service.sendBulkEmails(messages)

      expect(results).toHaveLength(250)
      expect(mockMessageRepository.save).toHaveBeenCalledTimes(250)
    })
  })

  describe("getDeliveryStatus", () => {
    it("should return delivery status", async () => {
      const message = {
        id: "message-id",
        status: DeliveryStatus.DELIVERED,
        deliveredAt: new Date(),
        openedAt: new Date(),
        attempts: 1,
        lastAttemptAt: new Date(),
      }

      mockMessageRepository.findOne.mockResolvedValue(message)

      const status = await service.getDeliveryStatus("message-id")

      expect(status.messageId).toBe("message-id")
      expect(status.status).toBe(DeliveryStatus.DELIVERED)
      expect(status.deliveredAt).toBeDefined()
      expect(status.openedAt).toBeDefined()
    })

    it("should throw error for non-existent message", async () => {
      mockMessageRepository.findOne.mockResolvedValue(null)

      await expect(service.getDeliveryStatus("non-existent")).rejects.toThrow("not found")
    })
  })

  describe("getMetrics", () => {
    it("should return email metrics", async () => {
      mockMessageRepository.count
        .mockResolvedValueOnce(100) // totalSent
        .mockResolvedValueOnce(95) // totalDelivered
        .mockResolvedValueOnce(80) // totalOpened
        .mockResolvedValueOnce(20) // totalClicked
        .mockResolvedValueOnce(3) // totalBounced
        .mockResolvedValueOnce(1) // totalSpamReports
        .mockResolvedValueOnce(2) // totalUnsubscribed

      mockMessageRepository.find.mockResolvedValue([
        { sentAt: new Date("2024-01-01T10:00:00Z"), deliveredAt: new Date("2024-01-01T10:01:00Z") },
        { sentAt: new Date("2024-01-01T11:00:00Z"), deliveredAt: new Date("2024-01-01T11:02:00Z") },
      ])

      const metrics = await service.getMetrics()

      expect(metrics.totalSent).toBe(100)
      expect(metrics.totalDelivered).toBe(95)
      expect(metrics.deliveryRate).toBe(95)
      expect(metrics.openRate).toBeCloseTo(84.21, 1)
      expect(metrics.clickRate).toBe(25)
      expect(metrics.bounceRate).toBe(3)
    })
  })

  describe("unsubscribe", () => {
    it("should unsubscribe email successfully", async () => {
      const unsubscribeData = {
        id: "unsubscribe-id",
        email: "test@example.com",
        category: EmailCategory.NEWSLETTER,
        unsubscribedAt: new Date(),
      }

      mockUnsubscribeRepository.create.mockReturnValue(unsubscribeData)
      mockUnsubscribeRepository.save.mockResolvedValue(unsubscribeData)

      const result = await service.unsubscribe("test@example.com", EmailCategory.NEWSLETTER)

      expect(result).toBe(true)
      expect(mockUnsubscribeRepository.create).toHaveBeenCalledWith({
        email: "test@example.com",
        category: EmailCategory.NEWSLETTER,
        unsubscribedAt: expect.any(Date),
      })
    })
  })

  describe("isUnsubscribed", () => {
    it("should return true for unsubscribed email", async () => {
      mockUnsubscribeRepository.findOne.mockResolvedValue({ email: "test@example.com" })

      const result = await service.isUnsubscribed("test@example.com", EmailCategory.NEWSLETTER)

      expect(result).toBe(true)
    })

    it("should return false for subscribed email", async () => {
      mockUnsubscribeRepository.findOne.mockResolvedValue(null)

      const result = await service.isUnsubscribed("test@example.com", EmailCategory.NEWSLETTER)

      expect(result).toBe(false)
    })
  })

  describe("cancelScheduledEmail", () => {
    it("should cancel scheduled email successfully", async () => {
      const scheduledMessage = {
        id: "scheduled-message-id",
        status: DeliveryStatus.PENDING,
        scheduledAt: new Date(Date.now() + 3600000), // 1 hour from now
      }

      mockMessageRepository.findOne.mockResolvedValue(scheduledMessage)
      mockMessageRepository.save.mockResolvedValue({
        ...scheduledMessage,
        status: DeliveryStatus.CANCELLED,
      })
      mockEmailQueue.removeJobs.mockResolvedValue(true)

      const result = await service.cancelScheduledEmail("scheduled-message-id")

      expect(result).toBe(true)
      expect(mockMessageRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: DeliveryStatus.CANCELLED }),
      )
    })

    it("should return false for non-existent message", async () => {
      mockMessageRepository.findOne.mockResolvedValue(null)

      const result = await service.cancelScheduledEmail("non-existent-id")

      expect(result).toBe(false)
    })

    it("should return false for already sent message", async () => {
      const sentMessage = {
        id: "sent-message-id",
        status: DeliveryStatus.SENT,
        scheduledAt: new Date(Date.now() + 3600000),
      }

      mockMessageRepository.findOne.mockResolvedValue(sentMessage)

      const result = await service.cancelScheduledEmail("sent-message-id")

      expect(result).toBe(false)
    })
  })

  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      expect(service.validateEmail("test@example.com")).toBe(true)
      expect(service.validateEmail("user.name+tag@domain.co.uk")).toBe(true)
      expect(service.validateEmail("user123@test-domain.com")).toBe(true)
    })

    it("should reject invalid email addresses", () => {
      expect(service.validateEmail("invalid-email")).toBe(false)
      expect(service.validateEmail("test@")).toBe(false)
      expect(service.validateEmail("@domain.com")).toBe(false)
      expect(service.validateEmail("test..test@domain.com")).toBe(false)
    })
  })
})
