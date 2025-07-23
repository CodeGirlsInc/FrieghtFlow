import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { Notification } from "./entities/notification.entity"
import { NotificationTemplate } from "./entities/notification-template.entity"
import { NotificationPreference } from "./entities/notification-preference.entity"
import { NotificationQueue } from "./entities/notification-queue.entity"
import { NotificationService } from "./services/notification.service"
import { NotificationTemplateService } from "./services/notification-template.service"
import { NotificationPreferenceService } from "./services/notification-preference.service"
import { EmailService } from "./services/email.service"
import { InAppNotificationService } from "./services/in-app-notification.service"
import { NotificationProcessorService } from "./services/notification-processor.service"
import { ShipmentNotificationListener } from "./listeners/shipment.listener"
import { NotificationsController } from "./controllers/notifications.controller"
import { NotificationPreferencesController } from "./controllers/notification-preferences.controller"
import { NotificationTemplatesController } from "./controllers/notification-templates.controller"
import { InAppNotificationsController } from "./controllers/in-app-notifications.controller"
import { EmailDebugController } from "./controllers/email-debug.controller"
import { RolesModule } from "../roles/roles.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationTemplate, NotificationPreference, NotificationQueue]),
    EventEmitterModule.forRoot(),
    RolesModule,
  ],
  controllers: [
    NotificationsController,
    NotificationPreferencesController,
    NotificationTemplatesController,
    InAppNotificationsController,
    EmailDebugController,
  ],
  providers: [
    NotificationService,
    NotificationTemplateService,
    NotificationPreferenceService,
    EmailService,
    InAppNotificationService,
    NotificationProcessorService,
    ShipmentNotificationListener,
  ],
  exports: [
    NotificationService,
    NotificationTemplateService,
    NotificationPreferenceService,
    EmailService,
    InAppNotificationService,
  ],
})
export class NotificationsModule {}
