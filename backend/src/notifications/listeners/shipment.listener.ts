import { Injectable } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import type { NotificationService } from "../services/notification.service"
import type { NotificationPreferenceService } from "../services/notification-preference.service"
import { NotificationType, NotificationPriority } from "../entities/notification.entity"
import type {
  ShipmentCreatedEvent,
  ShipmentDeliveredEvent,
  ShipmentDelayedEvent,
  ShipmentCancelledEvent,
} from "../events/shipment.events"

@Injectable()
export class ShipmentNotificationListener {
  constructor(
    private notificationService: NotificationService,
    private preferenceService: NotificationPreferenceService,
  ) {}

  @OnEvent("shipment.created")
  async handleShipmentCreated(event: ShipmentCreatedEvent): Promise<void> {
    console.log(`📦 Shipment created event received for shipment ${event.shipmentId}`)

    // Get user's enabled channels for this notification type
    const enabledChannels = await this.preferenceService.getEnabledChannels(
      event.recipientId,
      NotificationType.SHIPMENT_CREATED,
    )

    if (enabledChannels.length === 0) {
      console.log(`No enabled channels for user ${event.recipientId} for shipment created notifications`)
      return
    }

    const templateData = {
      shipmentId: event.shipmentId,
      trackingNumber: event.trackingNumber,
      recipientName: event.recipientName,
      origin: event.origin,
      destination: event.destination,
      estimatedDelivery: event.estimatedDelivery.toLocaleDateString(),
      items: event.items,
      actionUrl: `https://app.example.com/shipments/${event.shipmentId}/track`,
    }

    await this.notificationService.sendNotification({
      type: NotificationType.SHIPMENT_CREATED,
      channels: enabledChannels,
      priority: NotificationPriority.NORMAL,
      recipientIds: [event.recipientId],
      templateName: "shipment_created",
      templateData,
      relatedEntityId: event.shipmentId,
      relatedEntityType: "shipment",
      actionUrl: `https://app.example.com/shipments/${event.shipmentId}/track`,
      actionText: "Track Shipment",
    })
  }

  @OnEvent("shipment.delivered")
  async handleShipmentDelivered(event: ShipmentDeliveredEvent): Promise<void> {
    console.log(`📦 Shipment delivered event received for shipment ${event.shipmentId}`)

    const enabledChannels = await this.preferenceService.getEnabledChannels(
      event.recipientId,
      NotificationType.SHIPMENT_DELIVERED,
    )

    if (enabledChannels.length === 0) {
      console.log(`No enabled channels for user ${event.recipientId} for shipment delivered notifications`)
      return
    }

    const templateData = {
      shipmentId: event.shipmentId,
      trackingNumber: event.trackingNumber,
      recipientName: event.recipientName,
      deliveredAt: event.deliveredAt.toLocaleString(),
      deliveryLocation: event.deliveryLocation,
      signedBy: event.signedBy,
      deliveryNotes: event.deliveryNotes,
      actionUrl: `https://app.example.com/shipments/${event.shipmentId}`,
    }

    await this.notificationService.sendNotification({
      type: NotificationType.SHIPMENT_DELIVERED,
      channels: enabledChannels,
      priority: NotificationPriority.HIGH,
      recipientIds: [event.recipientId],
      templateName: "shipment_delivered",
      templateData,
      relatedEntityId: event.shipmentId,
      relatedEntityType: "shipment",
      actionUrl: `https://app.example.com/shipments/${event.shipmentId}`,
      actionText: "View Shipment",
    })
  }

  @OnEvent("shipment.delayed")
  async handleShipmentDelayed(event: ShipmentDelayedEvent): Promise<void> {
    console.log(`📦 Shipment delayed event received for shipment ${event.shipmentId}`)

    const enabledChannels = await this.preferenceService.getEnabledChannels(
      event.recipientId,
      NotificationType.SHIPMENT_DELAYED,
    )

    if (enabledChannels.length === 0) {
      return
    }

    const templateData = {
      shipmentId: event.shipmentId,
      trackingNumber: event.trackingNumber,
      recipientName: event.recipientName,
      originalDelivery: event.originalDelivery.toLocaleDateString(),
      newEstimatedDelivery: event.newEstimatedDelivery.toLocaleDateString(),
      delayReason: event.delayReason,
    }

    await this.notificationService.sendNotification({
      type: NotificationType.SHIPMENT_DELAYED,
      channels: enabledChannels,
      priority: NotificationPriority.HIGH,
      recipientIds: [event.recipientId],
      customTitle: `Shipment ${event.trackingNumber} Delayed`,
      customMessage: `Your shipment has been delayed. New estimated delivery: ${event.newEstimatedDelivery.toLocaleDateString()}. Reason: ${event.delayReason}`,
      relatedEntityId: event.shipmentId,
      relatedEntityType: "shipment",
      actionUrl: `https://app.example.com/shipments/${event.shipmentId}/track`,
      actionText: "Track Shipment",
    })
  }

  @OnEvent("shipment.cancelled")
  async handleShipmentCancelled(event: ShipmentCancelledEvent): Promise<void> {
    console.log(`📦 Shipment cancelled event received for shipment ${event.shipmentId}`)

    const enabledChannels = await this.preferenceService.getEnabledChannels(
      event.recipientId,
      NotificationType.SHIPMENT_CANCELLED,
    )

    if (enabledChannels.length === 0) {
      return
    }

    const templateData = {
      shipmentId: event.shipmentId,
      trackingNumber: event.trackingNumber,
      recipientName: event.recipientName,
      cancellationReason: event.cancellationReason,
      refundAmount: event.refundAmount,
    }

    await this.notificationService.sendNotification({
      type: NotificationType.SHIPMENT_CANCELLED,
      channels: enabledChannels,
      priority: NotificationPriority.URGENT,
      recipientIds: [event.recipientId],
      customTitle: `Shipment ${event.trackingNumber} Cancelled`,
      customMessage: `Your shipment has been cancelled. Reason: ${event.cancellationReason}${event.refundAmount ? `. Refund amount: $${event.refundAmount}` : ""}`,
      relatedEntityId: event.shipmentId,
      relatedEntityType: "shipment",
      actionUrl: `https://app.example.com/shipments/${event.shipmentId}`,
      actionText: "View Details",
    })
  }
}
