import { Test, type TestingModule } from "@nestjs/testing"
import { ShipmentNotificationListener } from "../listeners/shipment.listener"
import { NotificationService } from "../services/notification.service"
import { NotificationPreferenceService } from "../services/notification-preference.service"
import { NotificationType, NotificationChannel, NotificationPriority } from "../entities/notification.entity"
import { ShipmentCreatedEvent, ShipmentDeliveredEvent } from "../events/shipment.events"
import { jest } from "@jest/globals"

describe("ShipmentNotificationListener", () => {
  let listener: ShipmentNotificationListener
  let notificationService: NotificationService
  let preferenceService: NotificationPreferenceService

  const mockNotificationService = {
    sendNotification: jest.fn(),
  }

  const mockPreferenceService = {
    getEnabledChannels: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentNotificationListener,
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: NotificationPreferenceService,
          useValue: mockPreferenceService,
        },
      ],
    }).compile()

    listener = module.get<ShipmentNotificationListener>(ShipmentNotificationListener)
    notificationService = module.get<NotificationService>(NotificationService)
    preferenceService = module.get<NotificationPreferenceService>(NotificationPreferenceService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("handleShipmentCreated", () => {
    it("should send notifications for shipment created event", async () => {
      const event = new ShipmentCreatedEvent(
        "shipment-1",
        "TRK123456",
        "user-1",
        "user@example.com",
        "John Doe",
        "New York",
        "Los Angeles",
        new Date("2024-01-15"),
        [{ name: "Widget", quantity: 2, value: 50 }],
      )

      const enabledChannels = [NotificationChannel.EMAIL, NotificationChannel.IN_APP]
      mockPreferenceService.getEnabledChannels.mockResolvedValue(enabledChannels)
      mockNotificationService.sendNotification.mockResolvedValue([])

      await listener.handleShipmentCreated(event)

      expect(mockPreferenceService.getEnabledChannels).toHaveBeenCalledWith("user-1", NotificationType.SHIPMENT_CREATED)
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith({
        type: NotificationType.SHIPMENT_CREATED,
        channels: enabledChannels,
        priority: NotificationPriority.NORMAL,
        recipientIds: ["user-1"],
        templateName: "shipment_created",
        templateData: {
          shipmentId: "shipment-1",
          trackingNumber: "TRK123456",
          recipientName: "John Doe",
          origin: "New York",
          destination: "Los Angeles",
          estimatedDelivery: "1/15/2024",
          items: [{ name: "Widget", quantity: 2, value: 50 }],
          actionUrl: "https://app.example.com/shipments/shipment-1/track",
        },
        relatedEntityId: "shipment-1",
        relatedEntityType: "shipment",
        actionUrl: "https://app.example.com/shipments/shipment-1/track",
        actionText: "Track Shipment",
      })
    })

    it("should skip notification if no enabled channels", async () => {
      const event = new ShipmentCreatedEvent(
        "shipment-1",
        "TRK123456",
        "user-1",
        "user@example.com",
        "John Doe",
        "New York",
        "Los Angeles",
        new Date("2024-01-15"),
        [],
      )

      mockPreferenceService.getEnabledChannels.mockResolvedValue([])

      await listener.handleShipmentCreated(event)

      expect(mockNotificationService.sendNotification).not.toHaveBeenCalled()
    })
  })

  describe("handleShipmentDelivered", () => {
    it("should send notifications for shipment delivered event", async () => {
      const event = new ShipmentDeliveredEvent(
        "shipment-1",
        "TRK123456",
        "user-1",
        "user@example.com",
        "John Doe",
        new Date("2024-01-15T14:30:00Z"),
        "Front door",
        "John Doe",
        "Package left at front door",
      )

      const enabledChannels = [NotificationChannel.EMAIL, NotificationChannel.IN_APP]
      mockPreferenceService.getEnabledChannels.mockResolvedValue(enabledChannels)
      mockNotificationService.sendNotification.mockResolvedValue([])

      await listener.handleShipmentDelivered(event)

      expect(mockPreferenceService.getEnabledChannels).toHaveBeenCalledWith(
        "user-1",
        NotificationType.SHIPMENT_DELIVERED,
      )
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith({
        type: NotificationType.SHIPMENT_DELIVERED,
        channels: enabledChannels,
        priority: NotificationPriority.HIGH,
        recipientIds: ["user-1"],
        templateName: "shipment_delivered",
        templateData: {
          shipmentId: "shipment-1",
          trackingNumber: "TRK123456",
          recipientName: "John Doe",
          deliveredAt: event.deliveredAt.toLocaleString(),
          deliveryLocation: "Front door",
          signedBy: "John Doe",
          deliveryNotes: "Package left at front door",
          actionUrl: "https://app.example.com/shipments/shipment-1",
        },
        relatedEntityId: "shipment-1",
        relatedEntityType: "shipment",
        actionUrl: "https://app.example.com/shipments/shipment-1",
        actionText: "View Shipment",
      })
    })
  })
})
